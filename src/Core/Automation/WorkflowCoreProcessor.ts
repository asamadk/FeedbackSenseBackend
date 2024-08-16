import { In, IsNull, Not } from "typeorm";
import { Repository } from "../../Helpers/Repository";
import { Edge, Node, rabbitPayload, RObject, triggerType } from "../../Types/FlowTypes";
import { Workflow } from "../../Entity/WorkflowEntity";
import { recordType } from "../../Types/ApiTypes";
import { getTriggerNode, recordMatchCondition } from "../../Utils/FlowUtils/FlowUtils";
import { surveyFlowType } from "../../Types/SurveyTypes";
import { PathMapping } from "./PathMapping";
import { logger } from "../../Config/LoggerConfig";
import { BatchContext } from "./BatchContext";

export class WorkflowCoreProcessor {

    private queuePayload: rabbitPayload[];
    private flowId: string;
    private orgId: string;
    private recordType: recordType;
    private waitRecordIdComponentId: Map<string, string>
    private recordIdType: Set<string>;
    private batchContext: BatchContext;

    constructor(records: rabbitPayload[], key: string) {
        this.waitRecordIdComponentId = new Map<string, string>();
        this.recordIdType = new Set<string>();
        this.queuePayload = records;
        const keyArr = key.split('<>');
        this.flowId = keyArr[0];
        this.orgId = keyArr[1];
        this.recordType = keyArr[2] as recordType;
        this.batchContext = new BatchContext(this.flowId, this.orgId, this.recordType);
        this.filterWaitRecords();
        this.populateRecordTypeMap(records);
    }

    async execute() {
        const workflow = await this.isWorkflowPublished();
        if (workflow == null) { return; }
        let records = await this.fetchRecords();
        const finalRecords = [];
        records.forEach((rec: RObject) => {
            if (recordMatchCondition(workflow.json, rec, this.recordIdType)) {
                finalRecords.push(rec);
            }
        });
        this.queuePayload = null;
        records = this.populateWaitRecordsMaps(records);
        await this.processWorkflow(finalRecords, JSON.parse(workflow.json));
    }

    populateRecordTypeMap(records: rabbitPayload[]) {
        if (records?.length < 1) { return; }
        records.forEach(r => {
            const key = `${r.id}-${r.type}`;
            this.recordIdType.add(key);
        });
    }

    populateWaitRecordsMaps(records: RObject[]): RObject[] {
        const componentIdWaitRecords = new Map<string, RObject[]>();
        const filteredRecords = [];
        records.forEach(rec => {
            if (this.waitRecordIdComponentId.has(rec.id)) {
                //this record has been waiting
                const compId = this.waitRecordIdComponentId.get(rec.id);
                let waitRecs = componentIdWaitRecords.get(compId);
                if (waitRecs == null) { waitRecs = []; }
                waitRecs.push(rec);
                componentIdWaitRecords.set(compId, waitRecs);
            } else {
                filteredRecords.push(rec);
            }
        });
        this.batchContext.waitRecordInteract.storeComponentWaitRecords(componentIdWaitRecords);
        //TODO handle if wait records are there and normal records are not there
        return records;
    }

    filterWaitRecords() {
        this.queuePayload.forEach(qp => {
            if (qp.isWaitRecord === true) {
                this.waitRecordIdComponentId.set(qp.id, qp.componentId);
            }
        });
    }

    async processWorkflow(records: RObject[], flowJSON: surveyFlowType) {
        const nodes: Node[] = flowJSON.nodes;
        const edges: Edge[] = flowJSON.edges;

        const triggerNode: Node = this.getSourceNode(nodes);
        if (triggerNode == null) {
            throw new Error(`Workflow ${this.flowId} does not contains trigger node`);
        }
        let mapping = new PathMapping('next', this.recordType);
        mapping.records = records;

        let currentNode: Node = triggerNode;
        while (currentNode) {
            logger.info(`Processing workflow - ${this.flowId} :: node - ${currentNode.data.label}`);
            const node = this.batchContext.nodeFactory.getNodeInstance(currentNode, this.recordType);
            mapping = node.execute(mapping.records);
            currentNode = this.getNextNode(currentNode, edges, nodes);
        }

        await this.postProcessing();
    }

    async postProcessing() {
        try {
            await this.batchContext.workflowInteract.saveRecords();
        } catch (error) {
            logger.error(`WorkflowCoreProcessor :: saving records :: error - ${error.message}`);
        } finally {
            this.batchContext.workflowInteract.clearData();
        }

        try {
            await this.batchContext.taskInteract.createTasks();
        } catch (error) {
            logger.error(`WorkflowCoreProcessor :: TaskInteract :: error - ${error.message}`);
        } finally {
            this.batchContext.taskInteract.clearData();
        }

        try {
            await this.batchContext.emailInteract.sendEmails();
        } catch (error) {
            logger.error(`WorkflowCoreProcessor :: EmailInteract :: error - ${error.message}`);
        } finally {
            this.batchContext.emailInteract.clearData();
        }

        try {
            await this.batchContext.waitRecordInteract.saveWaitRecords(this.flowId);
        } catch (error) {
            logger.error(`WorkflowCoreProcessor :: WaitRecordInteract :: error - ${error.message}`);
        } finally {
            this.batchContext.waitRecordInteract.clearData();
        }

    }

    getSourceNode(nodes: Node[]) {
        return getTriggerNode(nodes);
    }

    getNextNode(currentNode: Node, edges: Edge[], nodes: Node[]): Node | null {
        const edge = edges.find(e => e.source === currentNode.id);
        if (edge) {
            return nodes.find(node => node.id === edge.target) || null;
        }
        return null;
    }

    async fetchRecords(): Promise<RObject[]> {
        const recordIds = [];

        this.queuePayload.forEach(rec => recordIds.push(rec.id));

        const whereClause = { id: In(recordIds) };
        const selectClause = { organization: { id: true } }
        const relationClause = { organization: true }

        if (this.recordType === 'company') {
            return await Repository.getCompany().find({
                where: whereClause,
                select: { ...selectClause, owner: { id: true }, pointOfContact: { id: true, email: true } },
                relations: { ...relationClause, owner: true, pointOfContact: true }
            });
        } else if (this.recordType === 'person') {
            return await Repository.getPeople().find({
                where: whereClause,
                select: { ...selectClause, company: { id: true } },
                relations: { ...relationClause, company: true }
            });
        } else if (this.recordType === 'task') {
            return await Repository.getTask().find({
                where: whereClause,
                select: { ...selectClause, company: { id: true }, person: { id: true }, owner: { id: true, email: true } },
                relations: { ...relationClause, company: true, person: true, owner: true }
            });
        } else {
            throw new Error(`Unsupported record type ${this.recordType}`);
        }
    }

    async isWorkflowPublished(): Promise<Workflow> {
        try {
            const workflow = await Repository.getWorkflow().findOneOrFail({
                where: {
                    flowId: Not(IsNull()),
                    flow: {
                        id: this.flowId,
                        is_published: true,
                        is_archived: false,
                        is_deleted: false
                    }
                },
                select: {
                    flow: {
                        id: true,
                        organization: { id: true },
                    }
                },
                relations: { flow: true }
            })
            if (workflow != null && workflow.id != null) {
                return workflow;
            } else {
                return null;
            }
        } catch (error) { return null; }
    }
}