import { Task } from "../../../Entity/TaskEntity";
import { TaskTrigger } from "../../../Triggers/TaskTrigger";

export class TaskInteract{
    
    private toCreateTasks :Task[]= [];

    saveTasks(tasks :Task[]){
        this.toCreateTasks = tasks
    }

    saveTask(task :Task){
        this.toCreateTasks.push(task);
    }

    async createTasks(){
        if(this.toCreateTasks.length > 0){
            await TaskTrigger.saveBulk(this.toCreateTasks);
            this.clearData();
        }
    }

    clearData(){
        this.toCreateTasks = [];
    }

}