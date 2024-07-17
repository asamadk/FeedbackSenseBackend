import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { Task } from "../../../Entity/TaskEntity";
import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { TaskInteract } from "../Interactors/TaskInteractor";
import { PathMapping } from "../PathMapping";

type createTaskSkeleton = {
    description: string,
    title: string,
    taskDesc: string,
    owner: string,
    priority: 'Low' | 'Medium' | 'High' | 'Urgent',
    dueDate: string,
}

export class CreateTaskNode extends BaseComponent {


    execute(records: RObject[]): PathMapping {
        const createTaskPayload: createTaskSkeleton = this.componentConfig;
        const toCreateTask = [];
        for (const record of records) {
            const newTask = new Task();
            newTask.title = createTaskPayload.title;
            newTask.description = createTaskPayload.taskDesc;
            newTask.owner = createTaskPayload.owner as any;
            newTask.priority = createTaskPayload.priority;
            newTask.status = 'Open';
            if (this.recordType === 'task' && record instanceof Task) {
                newTask.company = record.company;
                newTask.person = record.person;
            } else if (this.recordType === 'person' && record instanceof Person) {
                newTask.person = [record];
                newTask.company = [record.company];
            } else if (this.recordType === 'company' && record instanceof Company) {
                newTask.company = [record];
            }
            toCreateTask.push(newTask);
        }

        TaskInteract.getInstance().saveTasks(toCreateTask);
        const pathMapping = new PathMapping('next', this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }

}