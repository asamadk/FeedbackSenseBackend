import { AutomationQueue } from "../Core/Automation/AutomationQueue";
import { Task } from "../Entity/TaskEntity";
import { Repository } from "../Helpers/Repository";

export class TaskTrigger {

    static async saveBulk(task: Task[]) {
        const updatedList = [];
        const insertList = [];
        task.forEach(task => {
            if (task.id != null && task.id.length > 0) {
                updatedList.push(task);
            } else {
                insertList.push(task);
            }
        });
        
        await Repository.getTask().save(task);
        const queue = new AutomationQueue<Task>('task');
        await Promise.all([
            queue.addRecord(insertList, 'insert'),
            queue.addRecord(updatedList, 'update')
        ]);
    }

    static async save(task: Task) {
        await this.saveBulk([task]);
    }

}