import { AppDataSource } from "../Config/AppDataSource"
import { Activity } from "../Entity/ActivityEntity";
import { Company } from "../Entity/CompanyEntity"
import { CompanyHistory } from "../Entity/CompanyHistory";
import { CompanyTag } from "../Entity/CompanyTagEntity";
import { Flow } from "../Entity/FlowEntity";
import { HealthDesign } from "../Entity/HealthDesign";
import { JourneyLog } from "../Entity/JourneyLog";
import { JourneyStage } from "../Entity/JourneyStageEntity";
import { Notes } from "../Entity/Note";
import { Notification } from "../Entity/NotificationEntity";
import { OnboardingStage } from "../Entity/OnboardingStages";
import { Organization } from "../Entity/OrgEntity";
import { Person } from "../Entity/PersonEntity";
import { RiskStage } from "../Entity/RiskStages";
import { Survey } from "../Entity/SurveyEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Task } from "../Entity/TaskEntity";
import { UsageEvent } from "../Entity/UsageEvent";
import { UsageEventType } from "../Entity/UsageEventTypes";
import { UsageSession } from "../Entity/UsageSession";
import { User } from "../Entity/UserEntity";
import { WaitRecordsEntity } from "../Entity/WaitRecordsEntity";
import { Workflow } from "../Entity/WorkflowEntity";

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

    static getCompanyHistory(){
        return AppDataSource.getDataSource().getRepository(CompanyHistory);
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

    static getNotifications(){
        return AppDataSource.getDataSource().getRepository(Notification);
    }

    static getSurveys(){
        return AppDataSource.getDataSource().getRepository(Survey);
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

    static getOnboardingStage(){
        return AppDataSource.getDataSource().getRepository(OnboardingStage);
    }

    static getRiskStage(){
        return AppDataSource.getDataSource().getRepository(RiskStage);
    }

    static getJourneyLog(){
        return AppDataSource.getDataSource().getRepository(JourneyLog);
    }

    static getHealthDesign(){
        return AppDataSource.getDataSource().getRepository(HealthDesign);
    }

    static getFlow(){
        return AppDataSource.getDataSource().getRepository(Flow);
    }

    static getWorkflow(){
        return AppDataSource.getDataSource().getRepository(Workflow);
    }

    static getWaitRecords(){
        return AppDataSource.getDataSource().getRepository(WaitRecordsEntity);
    }

}