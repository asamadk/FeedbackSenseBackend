import { AppDataSource } from "../Config/AppDataSource"
import { Activity } from "../Entity/ActivityEntity";
import { Company } from "../Entity/CompanyEntity"
import { CompanyTag } from "../Entity/CompanyTagEntity";
import { Notes } from "../Entity/Note";
import { Person } from "../Entity/PersonEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Task } from "../Entity/TaskEntity";
import { UsageEventType } from "../Entity/UsageEventTypes";

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

    static getSurveyResponse(){
        return AppDataSource.getDataSource().getRepository(SurveyResponse);
    }

    static getActivity(){
        return AppDataSource.getDataSource().getRepository(Activity);
    }

    static getNotes(){
        return AppDataSource.getDataSource().getRepository(Notes);
    }

    static getUsageEventType(){
        return AppDataSource.getDataSource().getRepository(UsageEventType);
    }

}