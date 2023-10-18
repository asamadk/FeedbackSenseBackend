import { AppDataSource } from "../Config/AppDataSource";
import { Survey } from "../Entity/SurveyEntity";
import { SurveyLog } from "../Entity/SurveyLogEntity";

export class SurveyLogHelper {

    public static CREATE_ACTION = 'CREATE';
    public static READ_ACTION = 'READ';
    public static UPDATE_ACTION = 'UPDATE';
    public static UPDATE_THEME_ACTION = 'UPDATE_THEME';
    public static DELETE_ACTION = 'DELETE';

    public static async createLogEntry(details: {
        survey: Survey,
        user_id?: string,
        action_type: string,
        description?: string,
        data_before?: string,
        data_after?: string,
        IP_address?: string
    }): Promise<SurveyLog> {
        const log = new SurveyLog();
        log.survey = details.survey;
        log.user_id = details.user_id;
        log.action_type = details.action_type;
        log.description = details.description;
        log.data_before = details.data_before;
        log.data_after = details.data_after;
        log.IP_address = details.IP_address;

        return await AppDataSource.getDataSource().getRepository(SurveyLog).save(log);
    }

    static async getLogsForSurvey(surveyId: string): Promise<SurveyLog[]> {
        return await AppDataSource.getDataSource().getRepository(SurveyLog).find({ where: { survey: { id: surveyId } } });
    }

    static async deleteLog(logId: string): Promise<void> {
        await AppDataSource.getDataSource().getRepository(SurveyLog).delete(logId);
    }

}
