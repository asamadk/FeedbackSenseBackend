import { In } from "typeorm";
import { getRabbitMQChannel } from "../../Config/RabbitMQ";
import { Company } from "../../Entity/CompanyEntity";
import { recordQueue } from "../../Helpers/Constants";
import { Repository } from "../../Helpers/Repository";
import { recordType } from "../../Types/ApiTypes";
import * as amqp from 'amqplib';
import { Task } from "../../Entity/TaskEntity";
import { Person } from "../../Entity/PersonEntity";
import { Flow } from "../../Entity/FlowEntity";
import { logger } from "../../Config/LoggerConfig";
import { recordMatchCondition } from "../../Utils/FlowUtils/FlowUtils";
import { rabbitPayload } from "../../Types/FlowTypes";

export class AutomationQueue<T> {

    recordType: recordType;

    constructor(recordType: recordType) {
        this.recordType = recordType;
    }

    async addRecord(records: T[], type: 'insert' | 'update') {
        if (type == null || type.length < 1) { return; }
        if (records.length < 1) { return; }
        records = await this.checkAndPopulateOrgId(records);
        const orgIds = this.getUniqueOrgIds(records);
        if (orgIds == null || orgIds.size < 1) { return; }
        const validFlows = await this.getPublishedWorkflow(Array.from(orgIds));
        const filteredRecords = this.filterValidWorkflowRecords(validFlows, records);
        records = [];
        const toStoreRecords = this.filterCriteriaMatchingRecords(validFlows, filteredRecords);
        await this.addRecordToQueue(toStoreRecords, type);
    }

    async addRecordToQueue(filteredRecords: any[], type: 'insert' | 'update') {
        const channel = await getRabbitMQChannel();
        filteredRecords.forEach(record => {
            const payload: rabbitPayload = {
                id: record.id,
                type: type,
                recordType: this.recordType,
                flowId: record.flowId,
                orgId: record.organization.id
            }

            channel.sendToQueue(recordQueue, Buffer.from(JSON.stringify(payload)), {
                persistent: true,
            });
            logger.info(`Eligible records sent to RabbitMQ`);
        })
    }

    filterCriteriaMatchingRecords(validFlows: Flow[], filteredRecords: any[]): any[] {
        const orgIdFlows = new Map<string, Flow[]>();
        const orgIdRecords = new Map<string, T[]>();
        const finalRecords = [];

        validFlows.forEach(flow => {
            let flows = orgIdFlows.get(flow.organization.id);
            if (flows == null || flows.length < 1) { flows = []; }
            flows.push(flow);
            orgIdFlows.set(flow.organization.id, flows);
        });

        filteredRecords.forEach(rec => {
            let records = orgIdRecords.get(rec.organization.id);
            if (records == null || records.length < 1) { records = [] }
            records.push(rec);
            orgIdRecords.set(rec.organization.id, records);
        });

        const eligibleOrgIds = Array.from(orgIdFlows.keys());
        eligibleOrgIds.forEach(orgId => {
            const sameOrgFlows = orgIdFlows.get(orgId);
            const sameOrgRecords = orgIdRecords.get(orgId);
            if (sameOrgFlows == null || sameOrgFlows.length < 1 || sameOrgRecords == null || sameOrgRecords.length < 1) { return; }
            sameOrgRecords.forEach((rec: any) => {
                sameOrgFlows.forEach(flow => {
                    const isValid = recordMatchCondition(flow.workflows[0].json, rec);
                    if (isValid) {
                        rec.flowId = flow.id;
                        finalRecords.push(rec);
                    }
                });
            });
        });

        return finalRecords;
    }

    filterValidWorkflowRecords(flows: Flow[], records: any[]): any[] {
        const orgIds = new Set<string>();
        flows.forEach(flow => orgIds.add(flow.organization.id));
        const tmpRecords = [];
        records?.forEach(rec => {
            if (orgIds.has(rec.organization.id)) {
                tmpRecords.push(rec);
            }
        });
        return tmpRecords;
    }

    async getPublishedWorkflow(orgIds: string[]): Promise<Flow[]> {
        const flowRepo = Repository.getFlow()
        const validFlows = await flowRepo.find({
            where: {
                organization: {
                    id: In(orgIds)
                },
                is_published: true,
                is_archived: false,
                is_deleted: false,
                type: this.recordType
            },
            order: {
                createdAt: 'DESC'
            },
            select: {
                workflows: {
                    id: true,
                    json: true
                },
                organization: { id: true }
            },
            relations: { workflows: true, organization: true }
        });
        return validFlows;
    }

    getUniqueOrgIds(records: T[]): Set<string> {
        const orgIds = new Set<string>();
        records.forEach((r: any) => {
            orgIds.add(r.organization.id)
        });
        return orgIds;
    }

    async checkAndPopulateOrgId(records: T[]): Promise<any[]> {
        const addOrgs: string[] = [];
        if (this.recordType === 'company') {
            const existingOrgCompanies: Company[] = [];
            const companies: Company[] = records as Company[];
            companies.forEach(company => {
                if (company.organization == null || company.organization.id == null) {
                    addOrgs.push(company.id);
                } else {
                    existingOrgCompanies.push(company);
                }
            });

            const companiesWithOrgs = await Repository.getCompany().find({
                where: { id: In(addOrgs) },
                select: { organization: { id: true } },
                relations: { organization: true }
            });
            return [...companiesWithOrgs, ...existingOrgCompanies];

        } else if (this.recordType === 'task') {
            const existingOrgTask: Task[] = [];
            const tasks: Task[] = records as Task[];
            tasks.forEach(task => {
                if (task.organization == null || task.organization.id == null) {
                    addOrgs.push(task.id);
                } else {
                    existingOrgTask.push(task);
                }
            });

            const tasksWithOrgs = await Repository.getTask().find({
                where: { id: In(addOrgs) },
                select: { organization: { id: true } },
                relations: { organization: true }
            });
            return [...tasksWithOrgs, ...existingOrgTask];

        } else if (this.recordType === 'person') {
            const existingOrgPeople: Person[] = [];
            const people: Person[] = records as Person[];
            people.forEach(person => {
                if (person.organization == null || person.organization.id == null) {
                    addOrgs.push(person.id);
                } else {
                    existingOrgPeople.push(person);
                }
            });

            const peopleWithOrgs = await Repository.getPeople().find({
                where: { id: In(addOrgs) },
                select: { organization: { id: true } },
                relations: { organization: true }
            });
            return [...peopleWithOrgs, ...existingOrgPeople];
        }
        return records;
    }

}