import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { Survey } from "../Entity/SurveyEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { Workflow } from "../Entity/WorkflowEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { hasSurveyReachedResponseLimit, isSurveyEnded, sortSurveyFlowNodes } from "../Helpers/SurveyUtils";
import { responseRest } from "../Types/ApiTypes";
import { surveyFlowType, surveyTheme } from "../Types/SurveyTypes";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateSurveyFilledEmailHtml } from "../Utils/MailUtils/MailMarkup/SurveyMarkup";

export const getLiveSurveyNodes = async (surveyId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Survey retrieved');
    try {
        const surveyRepo = getDataSource(false).getRepository(Survey);
        const surveyFlow = getDataSource(false).getRepository(Workflow);
        const surveyConfigRepo = getDataSource(false).getRepository(SurveyConfig);


        const surveyConfig = await surveyConfigRepo.findOne({ where: { survey_id: surveyId } });
        if (surveyConfig != null) {
            const isEnded = isSurveyEnded(surveyConfig.time_limit);
            const isResLimitReached = await hasSurveyReachedResponseLimit(surveyConfig.response_limit, surveyId);

            if (isEnded === true || isResLimitReached === true) {
                return getCustomResponse({}, 410, 'Survey Closed, The survey is no longer accepting responses.', false);
            }
        }

        const surveyObj = await surveyRepo.findOneBy({
            id: surveyId
        });

        if (surveyObj == null || surveyObj.is_published === false) {
            return getCustomResponse({}, 410, 'This survey is not published', false);
        }

        if (surveyObj.workflow_id == null) {
            return getCustomResponse({}, 410, 'This survey is empty', false);
        }

        if (surveyObj == null || surveyObj.is_deleted === true || surveyObj.is_archived === true) {
            return getCustomResponse({}, 410, 'This survey is no longer available', false);
        }
        let surveyDesignStr = surveyObj.survey_design_json;
        if (surveyDesignStr === null || surveyDesignStr.length < 1) {
            surveyDesignStr = '{"id":1,"header":"Default","text":"default","color":["#f1f1f1","#D81159"],"textColor":"#000000"}';
        }
        const surveyDesign: surveyTheme = JSON.parse(surveyDesignStr)?.theme;
        const surveyBackground = JSON.parse(surveyDesignStr)?.background;
        const surveyFlowObj = await surveyFlow.findOneBy({
            id: surveyObj.workflow_id
        });

        if (surveyFlowObj == null) {
            return getCustomResponse({}, 404, 'Survey is not built properly', false);
        }

        const surveyDetailsStr = surveyFlowObj.json;
        if (surveyDetailsStr == null || surveyDetailsStr.length < 1) {
            return getCustomResponse({}, 410, 'This survey is no longer available', false);
        }
        const surveyDetail: surveyFlowType = JSON.parse(surveyDetailsStr);
        if (surveyDetail.nodes == null || surveyDetail.nodes.length < 1) {
            return getCustomResponse({}, 410, 'This survey is broken.', false);
        }

        const resData = {
            background: surveyBackground,
            theme: surveyDesign,
            nodes: sortSurveyFlowNodes(surveyDetail.nodes, surveyDetail.edges)
        }
        response.statusCode = 200;
        response.data = resData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const saveSurveyResponse = async (surveyId: string, responseData: any) => {
    try {
        const data = responseData?.data;
        const info = responseData?.info;
        const annUserId = responseData?.anUserId;

        const surveyResponseRepo = getDataSource(false).getRepository(SurveyResponse);
        let surveyResponse = await surveyResponseRepo.findOne({
            where: {
                anonymousUserId: annUserId,
                survey_id: surveyId
            }
        })

        if (surveyResponse == null) {
            surveyResponse = new SurveyResponse();
            await sendSurveyEmailToAdmin(surveyId, annUserId);
        }

        surveyResponse.survey_id = surveyId;
        surveyResponse.anonymousUserId = annUserId;
        surveyResponse.userDetails = info?.userAgent;
        if (surveyResponse.response == null) {
            surveyResponse.response = '[]';
        }

        const responseArr: any[] = JSON.parse(surveyResponse.response);
        responseArr.push(data);
        surveyResponse.response = JSON.stringify(responseArr);
        surveyResponseRepo.save(surveyResponse);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const sendSurveyEmailToAdmin = async (surveyId: string, responseId: string) => {
    const surveyRepo = getDataSource(false).getRepository(Survey);
    const surveyConfig = getDataSource(false).getRepository(SurveyConfig);

    const surveyConf = await surveyConfig.findOne({ where: { survey_id: surveyId } });
    if (surveyConf.emails == null) {
        return;
    }
    const survey = await surveyRepo.findOneBy({
        id: surveyId
    });

    const emailList = surveyConf.emails.split(',');
    emailList.forEach(email => {
        MailHelper.sendMail({
            html: generateSurveyFilledEmailHtml(survey.name, responseId),
            subject: 'New Survey Response Notification',
            to: email,
            from: process.env.MAIL_SENDER
        }, 'customers');
    })

}