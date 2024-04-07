import { AppDataSource } from "../Config/AppDataSource"
import { Company } from "../Entity/CompanyEntity"
import { CompanyTag } from "../Entity/CompanyTagEntity";
import { Person } from "../Entity/PersonEntity";
import { Task } from "../Entity/TaskEntity";

export class Repository {

    static getCompany(){
        return AppDataSource.getDataSource().getRepository(Company);
    }

    static getPeople(){
        return AppDataSource.getDataSource().getRepository(Person);
    }

    static getCompanyTags(){
        return AppDataSource.getDataSource().getRepository(CompanyTag);
    }

    static getTask(){
        return AppDataSource.getDataSource().getRepository(Task);
    }

}