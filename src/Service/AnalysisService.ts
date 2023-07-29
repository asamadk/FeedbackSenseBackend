import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Workflow } from "../Entity/WorkflowEntity";
import { processCombinedComponents } from "../Helpers/OverAllComponentHelper";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getPercentage } from "../Helpers/SurveyUtils";
import { responseRest } from "../Types/ApiTypes";

export const getFeedbackResponseList = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey retrieved');
        if (surveyId == null || surveyId === '') {
            return getCustomResponse({}, 404, 'Survey Id not provided', false);
        }
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyList = await surveyResponseRepo.findBy({ survey_id: surveyId });
        response.data = surveyList;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteFeedbackResponse = async (surveyResponseId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey response deleted');
        if (surveyResponseId == null || surveyResponseId === '' || surveyResponseId.length < 1) {
            return getCustomResponse({}, 404, 'Survey response Id not provided', false);
        }
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        await surveyResponseRepo.delete({
            id: surveyResponseId
        });
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getOverallResponse = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Overall survey response fetched');
        //TODO handle limit
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyResponse = await surveyResponseRepo.createQueryBuilder('survey_response')
            .select('COUNT(survey_response.created_at) as Response,CAST(survey_response.created_at AS DATE) as date')
            .where('survey_response.survey_id = :surId', { surId: surveyId })
            .groupBy('CAST(survey_response.created_at AS DATE)')
            .orderBy('date', 'ASC')
            .getRawMany();

        surveyResponse.forEach(surRes => {
            const surDate: Date = surRes.date;
            surRes.date = surDate.toLocaleDateString();
        });

        response.data = surveyResponse;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getSubDataResponse = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Sub-data fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyFlowRepo = AppDataSource.getDataSource().getRepository(Workflow);
        const surveyResponse = await surveyResponseRepo.find({
            where: {
                survey_id: surveyId
            },
            order: {
                created_at: 'DESC'
            }
        });

        const surveyWorkflow = await surveyFlowRepo.findOneBy({
            surveyId: surveyId
        });

        if (surveyWorkflow == null) {
            return getCustomResponse(null, 404, 'Survey flow is empty.', false);
        }

        const surveyFlowJSONStr = surveyWorkflow?.json;
        let surveyLength = 0;
        if (surveyFlowJSONStr != null && surveyFlowJSONStr.length > 0) {
            const surveyFlowJSON = JSON.parse(surveyFlowJSONStr);
            surveyLength = surveyFlowJSON?.nodes?.length;
        }
        const toCheckCompletionRate = [];
        surveyResponse.forEach(surRes => {
            const resStr = surRes.response;
            if (resStr == null || resStr.length < 1) {
                toCheckCompletionRate.push([]);
            } else {
                toCheckCompletionRate.push(JSON.parse(resStr));
            }
        });

        let defaulters = 0;

        toCheckCompletionRate.forEach(comRateCheck => {
            const compRateLength: number = comRateCheck?.length;
            if (compRateLength < surveyLength) {
                defaulters++;
            }
        });

        const completionRate = getPercentage(toCheckCompletionRate.length - defaulters, toCheckCompletionRate.length)
        const resMap = new Map<string, any>();
        resMap.set('totalViews', surveyResponse.length);
        resMap.set('completionRate', `${completionRate}%`);
        if (surveyResponse.length > 0) {
            resMap.set('lastResponse', surveyResponse[0].created_at.toDateString());
        } else {
            resMap.set('lastResponse', 'No response yet.');
        }
        response.data = Object.fromEntries(resMap);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getOverAllComponentsData = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('OverAll component data fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyResponses = await surveyResponseRepo.findBy({
            survey_id: surveyId
        });
        const componentResponses: any[] = [];
        surveyResponses.forEach(res => {
            const compResArrStr = res.response;
            if (compResArrStr == null || compResArrStr.length < 0) {
                return;
            }
            const tempArr = JSON.parse(compResArrStr);
            componentResponses.push(...tempArr);
        });
        //This map will hold component id as key and all components as value
        const combinedComponentMap = new Map<number, any[]>();
        const combinedComponentUIMap = new Map<string, any[]>();
        const uiIdVsIdMap = new Map<string,number>();

        componentResponses.forEach(compRes => {
            uiIdVsIdMap.set(compRes.uiId,compRes.id);
            let tempArr = combinedComponentMap.get(compRes.id);
            let tempUniqueComp = combinedComponentUIMap.get(compRes.uiId);
            if (tempUniqueComp == null) {
                tempUniqueComp = [];
            }
            if (tempArr == null) {
                tempArr = [];
            }
            tempUniqueComp.push(compRes);
            tempArr.push(compRes);
            combinedComponentUIMap.set(compRes.uiId, tempUniqueComp);
            combinedComponentMap.set(compRes.id, tempArr);
        });
        response.data = {
            info : Object.fromEntries(
                processCombinedComponents(combinedComponentUIMap,uiIdVsIdMap)
            ),
            idMap : Object.fromEntries(uiIdVsIdMap)
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}