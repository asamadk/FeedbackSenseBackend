import { getDataSource } from "../Config/AppDataSource";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAllSurveyType = async ()  : Promise<responseRest> => {
    const response = getDefaultResponse('Retrieved survey types successfully');
    
    const surveyTypeRepository = getDataSource(false).getRepository(SurveyType);
    const surveyList = await surveyTypeRepository.find();
    response.data = surveyList;
    return response;
}