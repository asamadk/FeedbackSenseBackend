import { logger } from "../../../Config/LoggerConfig";
import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { Task } from "../../../Entity/TaskEntity";
import { Repository } from "../../../Helpers/Repository";
import { recordType } from "../../../Types/ApiTypes";
import { RObject } from "../../../Types/FlowTypes";

export class WorkflowInteract {

    static instance: WorkflowInteract;

    static getInstance(recordType: recordType) {
        if (this.instance == null) {
            this.instance = new WorkflowInteract(recordType);
        }
        return this.instance;
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
        if (this.recordType === 'company') {
            const tmp: Company[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Company));
            await Repository.getCompany().save(tmp);
        } else if (this.recordType === 'person') {
            const tmp: Person[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Person));
            await Repository.getPeople().save(tmp);
        } else if (this.recordType === 'task') {
            const tmp: Task[] = [];
            this.toUpdateRecords.forEach(r => tmp.push(r as Task));
            await Repository.getTask().save(tmp);
        } else {
            throw new Error('Invalid record type');
        }
    }

}