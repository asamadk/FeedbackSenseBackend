import { Task } from "../../../Entity/TaskEntity";
import { Repository } from "../../../Helpers/Repository";

export class TaskInteract{

    static instance :TaskInteract;
    
    static getInstance(){
        if(this.instance == null){
            this.instance = new TaskInteract();
        }
        return this.instance;
    }

    private toCreateTasks :Task[]= [];

    saveTasks(tasks :Task[]){
        this.toCreateTasks = tasks
    }

    saveTask(task :Task){
        this.toCreateTasks.push(task);
    }

    async createTasks(){
        if(this.toCreateTasks.length > 0){
            await Repository.getTask().insert(this.toCreateTasks);
            this.clearData();
        }
    }

    private clearData(){
        this.toCreateTasks = [];
    }

}