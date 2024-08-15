import { logger } from "../../../Config/LoggerConfig";
import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { Task } from "../../../Entity/TaskEntity";
import { Repository } from "../../../Helpers/Repository";
import { CompanyTrigger } from "../../../Triggers/CompanyTrigger";
import { PersonTrigger } from "../../../Triggers/PersonTrigger";
import { TaskTrigger } from "../../../Triggers/TaskTrigger";
import { recordType } from "../../../Types/ApiTypes";
import { RObject } from "../../../Types/FlowTypes";

export class WorkflowInteract {

    static instance: Map<string, WorkflowInteract>;

    static getInstance(recordType: recordType) {
        if (this.instance == null) {
            this.instance = new Map<string, WorkflowInteract>();
        }
        if (this.instance.has(recordType) === false) {
            this.instance.set(recordType, new WorkflowInteract(recordType));
        }
        return this.instance.get(recordType);
    }

    constructor(recordType: recordType) {
        this.recordType = recordType;
    }

    private recordType: recordType;
    private toUpdateRecords: RObject[] = [];

    storeRecords(records: RObject[]) {
        if (this.toUpdateRecords == null) { this.toUpdateRecords = []; }
        records.forEach(r => this.toUpdateRecords.push(r));
    }

    async saveRecords() {
        logger.info(`Saving records :: Size - ${this.toUpdateRecords.length}`);
        console.log("🚀 ~ WorkflowInteract ~ saveRecords ~ this.toUpdateRecords:", this.toUpdateRecords);
        console.log("🚀 ~ WorkflowInteract ~ saveRecords ~ this.recordType:", this.recordType)
        if (this.toUpdateRecords.length < 1) {
            this.clearData();
            return;
        }
        if (this.recordType === 'company') {
            const tmp: Company[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Company));
            await CompanyTrigger.saveBulk(tmp);
        } else if (this.recordType === 'person') {
            const tmp: Person[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Person));
            await PersonTrigger.saveBulk(tmp);
        } else if (this.recordType === 'task') {
            const tmp: Task[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Task));
            await TaskTrigger.saveBulk(tmp);
        } else {
            throw new Error('Invalid record type');
        }
        this.clearData();
    }

    clearData() {
        this.toUpdateRecords = [];
    }

}