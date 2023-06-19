import { Survey } from "../Entity/SurveyEntity";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { getDataSource } from '../Config/AppDataSource';
import { responseRest } from "../Types/ApiTypes";
import { User } from "../Entity/UserEntity";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Workflow } from "../Entity/WorkflowEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { cleanSurveyFlowJSON, createSurveyConfig, getMaxResponseLimit } from "../Helpers/SurveyUtils";
import { logger } from "../Config/LoggerConfig";
import { SurveyResponse } from "../Entity/SurveyResponse";


export const getDetailedSurvey = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey retrieved successfully');
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyDetail = await surveyRepository.find({
            relations: {
                user: true,
                surveyType: true,
                workflows: true,
                folder: true
            },
            where: {
                id: surveyId,
            }
        });
        if (surveyDetail.length > 0) {
            response.data = surveyDetail[0];
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getAllSurveys = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey retrieved successfully');
        const surveyList = await getDataSource(false).query(
            `SELECT s.*, u.image,u.name as username
            FROM survey AS s
            JOIN user AS u ON u.id = s.user_id
            WHERE u.email = '${userEmail}' AND s.is_deleted = false;
            `
        );
        response.data = surveyList;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}



export const createSurvey = async (surveyTypeId: string, user: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey created successfully');
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyTypeRepo = getDataSource(false).getRepository(SurveyType);
        const userRepository = getDataSource(false).getRepository(User);
        const surveyType = await surveyTypeRepo.findOneBy({
            id: surveyTypeId
        });
        if (surveyType == null) {
            response.message = ' The survey type does not exists ';
            response.success = false;
            response.statusCode = 404;
            return response;
        }
        const userEmail: string = user?._json?.email;
        if (userEmail == null || userEmail.length < 1) {
            return getCustomResponse(null, 404, 'User not found', false);
        }
        const savedUser = await userRepository.findOneBy({
            email: user?._json?.email
        });
        if (savedUser == null) {
            return getCustomResponse([], 404, ' The user does not exists ', false);
        }
        const surveyObj = new Survey();
        surveyObj.user_id = savedUser.id;
        surveyObj.name = 'New survey - ' + new Date().toDateString();
        surveyObj.survey_type_id = surveyType.id;
        surveyObj.survey_design_json = '{"theme":{"id":0,"header":"Lavender","text":"Trending","color":["#8943FF","#C9EEFF"],"textColor":"#ffffff","shade":"#E4D3FF"},"background":{"id":0,"name":"Plain","value":"plain"}}';
        await surveyRepository.save(surveyObj);

        await createSurveyConfig(savedUser.id, surveyObj.id);
        response.data = surveyObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const moveSurveyToFolder = async (folderId: string, surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey moved successfully');
        if (folderId == null || folderId.length == 0) {
            return getCustomResponse([], 404, ' Folder id is not present ', false);
        }
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyObj = await surveyRepository.findOneBy({
            id: surveyId
        });
        if (surveyObj == null) {
            return getCustomResponse([], 404, ' Survey not found ', false);
        }
        surveyObj.folder_id = folderId;
        await surveyRepository.save(surveyObj);
        response.data = surveyObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const enableDisableSurvey = async (surveyId: string, enable: boolean): Promise<responseRest> => {
    try {
        const response = getDefaultResponse(`Survey ${enable == true ? ' enabled ' : ' disabled '} successfully`);
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyObj = await surveyRepository.findOneBy({
            id: surveyId
        });
        if (surveyObj == null) {
            response.message = ' The survey does not exists ';
            response.success = false;
            response.statusCode = 404;
            return response;
        }
        surveyObj.is_published = enable;
        const result: boolean = await updateActiveSurveyLimit(enable, surveyObj.user_id);
        if (result == false) {
            response.message = 'Active survey limit reached. Please disable some survey to activate this survey.';
            response.success = false;
            return response;
        }
        await surveyRepository.save(surveyObj);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const updateActiveSurveyLimit = async (enable: boolean, userId: string): Promise<boolean> => {
    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const subscriptionObj: Subscription = await subscriptionRepo.findOneBy({
        user: { id: userId }
    });

    if (subscriptionObj != null) {
        const subLimitStr = subscriptionObj.sub_limit;
        const subLimitObj = JSON.parse(subLimitStr);
        let usedSurveyLimit: number = subLimitObj.usedSurveyLimit;
        const maxSurveyLimit: number = subLimitObj.activeSurveyLimit;
        if (enable == true) {
            usedSurveyLimit++;
        } else {
            usedSurveyLimit--;
            if (usedSurveyLimit < 0) {
                usedSurveyLimit = 0;
            }
        }
        if (usedSurveyLimit > maxSurveyLimit) {
            return false
        }
        subLimitObj.usedSurveyLimit = usedSurveyLimit;
        subscriptionObj.sub_limit = JSON.stringify(subLimitObj);
        await subscriptionRepo.save(subscriptionObj);
        return true;
    }
    return true;
}

export const softDeleteSurvey = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey deleted successfully');
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyObj = await surveyRepository.findOneBy({
            id: surveyId
        });
        if (surveyObj == null) {
            response.message = 'The survey does not exists ';
            response.success = false;
            response.statusCode = 404;
            return response;
        }
        const wasSurveyPublished = surveyObj.is_published;
        surveyObj.is_deleted = true;
        surveyObj.is_published = false;

        await surveyRepository.save(surveyObj);
        if (wasSurveyPublished === true) {
            await updateActiveSurveyLimit(false, surveyObj.user_id);
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const saveSurveyFlow = async (surveyId: string, surveyJSON: string, deleteResponses: boolean): Promise<responseRest> => {
    const response = getDefaultResponse('Survey flow saved successfully');
    try {
        if (surveyId == null || surveyId === '') {
            return getCustomResponse([], 404, ' Survey id not found ', false);
        }
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyResponseRepo = getDataSource(false).getRepository(SurveyResponse);
        const surveyData = await surveyRepository.findOneBy({ id: surveyId });
        const surveyFlowId: string = surveyData.workflow_id;
        surveyJSON = cleanSurveyFlowJSON(surveyJSON);
        if (surveyFlowId == null || surveyFlowId === '') {
            const flowObj: Workflow = await createSurveyFlow(surveyJSON, surveyId);
            surveyData.workflow_id = flowObj.id;
            await surveyRepository.save(surveyData);
        } else {
            await updateSurveyFlow(surveyJSON, surveyFlowId);
        }
        if (deleteResponses === true) {
            await surveyResponseRepo.delete({
                survey_id: surveyId
            });
        }
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }

    return response;
}

export const checkIfSurveyHasResponse = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey checked.');
        const surveyResponseRepo = getDataSource(false).getRepository(SurveyResponse);
        const responseCount = await surveyResponseRepo.count({
            where: {
                survey_id: surveyId
            }
        });
        response.data = {};
        response.data.alreadyHasResponse = responseCount > 0 ? true : false;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const updateSurveyFlow = async (surveyJson: string, surveyFlowId: string): Promise<Workflow> => {
    const flowRepository = getDataSource(false).getRepository(Workflow);
    const flowObj = await flowRepository.findOneBy({ id: surveyFlowId });
    flowObj.json = surveyJson;
    return flowRepository.save(flowObj);
}

export const createSurveyFlow = (surveyJson: string, surveyId: string): Promise<Workflow> => {
    const flowRepository = getDataSource(false).getRepository(Workflow);
    const flowObj = new Workflow();
    flowObj.json = surveyJson
    flowObj.surveyId = surveyId;
    return flowRepository.save(flowObj);
}

export const saveSurveyDesign = async (surveyId: string, surveyJSON: string): Promise<responseRest> => {
    // console.log("🚀 ~ file: SurveyService.ts:272 ~ saveSurveyDesign ~ surveyJSON:", surveyJSON)
    try {
        const response = getDefaultResponse('Survey design saved successfully');
        if (surveyId == null || surveyId === '') {
            return getCustomResponse([], 404, ' Survey id not found ', false);
        }
        const surveyRepository = getDataSource(false).getRepository(Survey);
        const surveyData = await surveyRepository.findOneBy({ id: surveyId });
        if (surveyData == null) {
            return getCustomResponse([], 404, ' Survey not found ', false);
        }
        surveyData.survey_design_json = surveyJSON;
        await surveyRepository.save(surveyData);
        response.data = surveyData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateSurveyConfig = async (surveyId: string, configObj: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey configurations saved successfully');
        if (surveyId == null || surveyId === '') {
            return getCustomResponse([], 404, ' Survey id not found ', false);
        }
        const surveyConfigRepo = getDataSource(false).getRepository(SurveyConfig);
        let surveyConfigObj = await surveyConfigRepo.findOneBy({
            survey_id: surveyId
        });

        if (surveyConfigObj == null) {
            surveyConfigObj = new SurveyConfig();
        }

        const maxResponseLimit = await getMaxResponseLimit();
        if (maxResponseLimit !== 0 && configObj.stopCount > maxResponseLimit) {
            return getCustomResponse(
                [],
                400,
                `Your current subscription allows a maximum of ${maxResponseLimit} responses. Please upgrade your subscription to increase the allowed number of responses.`,
                false
            );
        }

        surveyConfigObj.survey_id = surveyId;
        if (configObj.stopCount != null) {
            surveyConfigObj.response_limit = configObj.stopCount;
        } else {
            surveyConfigObj.response_limit = 0;
        }

        if (configObj.stopTime != null) {
            surveyConfigObj.time_limit = configObj.stopTime;
        } else {
            surveyConfigObj.time_limit = null;
        }

        if (configObj.emails != null) {
            surveyConfigObj.emails = configObj.emails;
        } else {
            surveyConfigObj.emails = null;
        }

        // console.log("🚀 ~ file: SurveyService.ts:229 ~ updateSurveyConfig ~ surveyConfigObj:", surveyConfigObj)
        await surveyConfigRepo.save(surveyConfigObj);
        response.data = surveyConfigObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getSurveyConfigData = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey fetched successfully');
        const surveyConfigRepo = getDataSource(false).getRepository(SurveyConfig);
        if (surveyId == null || surveyId === '') {
            return getCustomResponse([], 404, ' Survey id not found ', false);
        }

        const surveyConfigObj = await surveyConfigRepo.findOneBy({
            survey_id: surveyId
        });

        if (surveyConfigObj == null) {
            return getCustomResponse([], 404, ' Survey config not found ', false);
        }
        response.data = surveyConfigObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateSurveyName = async (surveyId: string, payload: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Survey name updated successfully');
        const surveyRepo = getDataSource(false).getRepository(Survey);
        const surveyObj = await surveyRepo.findOneBy({
            id: surveyId
        });
        if (surveyObj == null) {
            return getCustomResponse([], 404, ' Survey config not found ', false);
        }
        surveyObj.name = payload.surveyName;
        await surveyRepo.save(surveyObj);
        response.data = surveyObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

// export const duplicate