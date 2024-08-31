import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { Task } from "../../../Entity/TaskEntity";
import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { WorkflowInteract } from "../Interactors/WorkflowInteractor";
import { PathMapping } from "../PathMapping";

export class AssignOwnerNode extends BaseComponent{
    
    execute(records: RObject[]): PathMapping {
        const ownerId :string = this.componentConfig?.owner;
        for(const record of records){
            if(this.recordType === 'company' && record instanceof Company){
                record.owner = ownerId as any;
            }else if(this.recordType === 'task' && record instanceof Task){
                record.owner = ownerId as any;
            }else if(this.recordType === 'person' && record instanceof Person){
                record.owner = ownerId as any;
            }
        }

        this.batchContext.workflowInteract.storeRecords(records);
        const pathMapping = new PathMapping('next',this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }

}