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
    }

    clearData(){
        this.toUpdateRecords = [];
    }

}