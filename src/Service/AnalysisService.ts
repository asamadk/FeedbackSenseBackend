import { Between } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Workflow } from "../Entity/WorkflowEntity";
import { ExportHelper } from "../Helpers/ExportHelper";
import { processCombinedComponents } from "../Helpers/OverAllComponentHelper";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getPercentage } from "../Helpers/SurveyUtils";
import { durationType, responseRest } from "../Types/ApiTypes";
import { getDateFromDuration } from "../Helpers/DateTimeHelper";
import { Survey } from "../Entity/SurveyEntity";
import { FilterHelper } from "../Helpers/FilterHelper";
import { FilterPayloadType } from "../Types/SurveyTypes";

export const getFeedbackResponseList = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey retrieved');
        if (surveyId == null || surveyId === '') {
            return getCustomResponse({}, 404, 'Survey Id not provided', false);
        }
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyList = await surveyResponseRepo.find({
            where : { 
                survey_id: surveyId
            },
            select : {
                company : {
                    id : true,
                    name : true
                },
                person : {
                    id : true,
                    firstName : true,
                    lastName : true
                }
            },
            relations : {
                company : true,
                person : true
            }
        })
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

export const getOverallResponse = async (surveyId: string, duration: durationType): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Overall survey response fetched');

        if (duration == null || duration.startDate == null || duration.endDate == null) {
            return response;
        }

        const startDate = getDateFromDuration(duration.startDate, 'start');
        const endDate = getDateFromDuration(duration.endDate, 'end');

        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyResponse = await surveyResponseRepo.createQueryBuilder('survey_response')
            .select('COUNT(survey_response.created_at) as Response, CAST(survey_response.created_at AS DATE) as date')
            .where('survey_response.survey_id = :surId', { surId: surveyId })
            .andWhere('survey_response.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
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

export const getSubDataResponse = async (surveyId: string, duration: durationType): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Sub-data fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyFlowRepo = AppDataSource.getDataSource().getRepository(Workflow);

        const startDate = getDateFromDuration(duration.startDate, 'start');
        const endDate = getDateFromDuration(duration.endDate, 'end');

        const queryFilter = {
            survey_id: surveyId,
            created_at: Between(startDate, endDate)
        }

        const surveyResponse = await surveyResponseRepo.find({
            where: queryFilter,
            order: {
                created_at: 'DESC'
            }
        });
        if (surveyResponse == null || surveyResponse.length < 1) {
            response.data = null;
            return response;
        }

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
            let surveyCompleted = false;
            comRateCheck.forEach(temp => {
                if (temp?.data?.surveyCompleted === true) {
                    surveyCompleted = true;
                    return;
                }
            });
            if (surveyCompleted === false) {
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

export const getOverAllComponentsData = async (
    surveyId: string,
    duration: durationType,
    filterPayload: FilterPayloadType[]
): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('OverAll component data fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const startDate = getDateFromDuration(duration.startDate, 'start');
        const endDate = getDateFromDuration(duration.endDate, 'end');

        const surveyResponses = await surveyResponseRepo.findBy({
            survey_id: surveyId,
            created_at: Between(startDate, endDate)
        });

        if (surveyResponses == null || surveyResponses.length < 1) {
            return response;
        }

        const componentResponses: any[] = [];
        
        surveyResponses.forEach(res => {
            const compResArrStr = res.response;
            if (compResArrStr == null || compResArrStr.length < 0) {
                return;
            }
            const tempArr: any[] = JSON.parse(compResArrStr);
            //TODO write unit test from main controller as how data is filtered and returned.
            //Filtering out responses that do not satisfy filter data
            const conditionMatched = FilterHelper.doesResponseSatisfiesCondition(tempArr, filterPayload);
            if (conditionMatched === false) {
                return;
            }
            tempArr.forEach(tmp => {
                tmp.createdDate = res.created_at
            });
            componentResponses.push(...tempArr);
        });

        //This map will hold component id as key and all components as value
        const combinedComponentMap = new Map<number, any[]>();
        const combinedComponentUIMap = new Map<string, any[]>();
        const uiIdVsIdMap = new Map<string, number>();

        componentResponses.forEach(compRes => {
            uiIdVsIdMap.set(compRes.uiId, compRes.id);
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
            info: Object.fromEntries(
                processCombinedComponents(combinedComponentUIMap, uiIdVsIdMap)
            ),
            idMap: Object.fromEntries(uiIdVsIdMap)
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getSurveyFilterData = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Filters fetched');
        const surveyRepository = AppDataSource.getDataSource().getRepository(Survey);
        const surveyData = await surveyRepository.find({
            where: {
                id: surveyId
            },
            relations: {
                workflows: true
            }
        });
        if (surveyData == null || surveyData.length < 1 || surveyData[0].workflows == null || surveyData[0].workflows.length < 1) {
            throw new Error('The selected survey is empty.');
        }
        const surveyWorkflow = surveyData[0].workflows[0];
        const flowJSON = surveyWorkflow.json;
        response.data = FilterHelper.getFilterDataFromSurvey(flowJSON);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const exportSurveyDataToCSV = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('CSV Fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyList = await surveyResponseRepo.findBy({ survey_id: surveyId });
        const exportHelper = new ExportHelper();
        const csvData = exportHelper.getIndividualResponseCSV(surveyList);
        response.data = {
            name: `survey-response-${new Date().toDateString()}.csv`, //file name,
            result: csvData //csv file
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const exportSurveyDataToJSON = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('JSON Fetched.');
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
        const surveyList = await surveyResponseRepo.findBy({ survey_id: surveyId });
        const exportHelper = new ExportHelper();
        const jsonData = exportHelper.getIndividualResponseJSON(surveyList);
        response.data = {
            name: `survey-response-${new Date().toDateString()}.json`, //file name,
            result: jsonData //csv file
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}