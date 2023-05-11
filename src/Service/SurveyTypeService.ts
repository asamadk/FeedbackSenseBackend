import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAllSurveyType = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Retrieved survey types successfully');
        const surveyTypeRepository = getDataSource(false).getRepository(SurveyType);
        const surveyList = await surveyTypeRepository.find();
        response.data = surveyList;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}