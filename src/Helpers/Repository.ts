import { AppDataSource } from "../Config/AppDataSource"
import { Activity } from "../Entity/ActivityEntity";
import { Company } from "../Entity/CompanyEntity"
import { CompanyTag } from "../Entity/CompanyTagEntity";
import { HealthDesign } from "../Entity/HealthDesign";
import { JourneyLog } from "../Entity/JourneyLog";
import { JourneyStage } from "../Entity/JourneyStageEntity";
import { JourneySubStage } from "../Entity/JourneySubStageEntity";
import { Notes } from "../Entity/Note";
import { Organization } from "../Entity/OrgEntity";
import { Person } from "../Entity/PersonEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Task } from "../Entity/TaskEntity";
import { UsageEvent } from "../Entity/UsageEvent";
import { UsageEventType } from "../Entity/UsageEventTypes";
import { UsageSession } from "../Entity/UsageSession";
import { User } from "../Entity/UserEntity";

export class Repository {

    static getUsageEvent(){
        return AppDataSource.getDataSource().getRepository(UsageEvent);
    }

    static getUsageSession(){
        return AppDataSource.getDataSource().getRepository(UsageSession);
    }

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

    static getUser(){
        return AppDataSource.getDataSource().getRepository(User);
    }

    static getOrg(){
        return AppDataSource.getDataSource().getRepository(Organization);
    }

    static getJourneyStage(){
        return AppDataSource.getDataSource().getRepository(JourneyStage);
    }

    static getJourneySubStage(){
        return AppDataSource.getDataSource().getRepository(JourneySubStage);
    }

    static getJourneyLog(){
        return AppDataSource.getDataSource().getRepository(JourneyLog);
    }

    static getHealthDesign(){
        return AppDataSource.getDataSource().getRepository(HealthDesign);
    }

}