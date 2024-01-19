import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { LOGO_DATA, SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { Survey } from "../Entity/SurveyEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { User } from "../Entity/UserEntity";
import { Workflow } from "../Entity/WorkflowEntity";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getCountOfSurveysForOrganizationByMonth, hasSurveyReachedResponseLimit, isSurveyEnded, sortSurveyFlowNodes } from "../Helpers/SurveyUtils";
import { responseRest } from "../Types/ApiTypes";
import { surveyFlowType, surveyTheme } from "../Types/SurveyTypes";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateSurveyFilledEmailHtml } from "../Utils/MailUtils/MailMarkup/SurveyMarkup";

export const getLiveSurveyNodes = async (surveyId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Survey retrieved');
    try {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyFlow = AppDataSource.getDataSource().getRepository(Workflow);
        const surveyConfigRepo = AppDataSource.getDataSource().getRepository(SurveyConfig);
        const userRepo = AppDataSource.getDataSource().getRepository(User);

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

        if (surveyObj == null) {
            return getCustomResponse({}, 410, 'Survey not found', false);
        }

        const surveyUser = await userRepo.findOne({ where: { id: surveyObj.user_id } });
        const totalSurveyResponse = await getCountOfSurveysForOrganizationByMonth(surveyUser.organization_id, surveyId);

        await CustomSettingsHelper.getInstance().initialize(surveyUser.organization_id);
        const responseCapacity = CustomSettingsHelper.getInstance().getCustomSettings(SURVEY_RESPONSE_CAPACITY);

        if (parseInt(responseCapacity) < totalSurveyResponse) {
            throw new Error('Sorry, but the survey limit for this survey has been reached. ');
        }

        if (surveyObj.is_published === false) {
            return getCustomResponse({}, 410, 'This survey is not published', false);
        }

        if (surveyObj.is_deleted === true || surveyObj.is_archived === true) {
            return getCustomResponse({}, 410, 'This survey is no longer available', false);
        }

        if (surveyObj.workflow_id == null) {
            return getCustomResponse({}, 410, 'This survey is empty', false);
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

        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
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
    const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
    const surveyConfig = AppDataSource.getDataSource().getRepository(SurveyConfig);

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

export const getSurveyLogo = async (surveyId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Logo retrieved');
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);

        const survey = await surveyRepo.findOneBy({ id: surveyId });
        const surveyUser = await userRepo.findOneBy({ id: survey.user_id });
        const logoCustomSetting = await customSettingsRepo.findOneBy({
            organizationId: surveyUser.organization_id,
            fKey: LOGO_DATA
        });
        response.data = logoCustomSetting.fValue;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getWebSurveyScript = async (surveyId: string): Promise<string> => {
    const surveyConfigRepo = AppDataSource.getDataSource().getRepository(SurveyConfig);
    const surveyConfig = await surveyConfigRepo.findOneByOrFail({ survey_id: surveyId });

    let positionCSS = ``;
    if (surveyConfig.widget_position === 'bottom-right') {
        positionCSS = `
            transform-origin : top right;
            right: 0;
            top: 80%;
        `;
    } else if (surveyConfig.widget_position === 'top-right') {
        positionCSS = `
            transform-origin : top right;
            right: 0;
            top: 30%;
        `;
    } else if (surveyConfig.widget_position === 'top-left') {
        positionCSS = `
            transform-origin : left bottom;
            left: 0;
            top: 30%;
        `;
    } else if (surveyConfig.widget_position === 'bottom-left') {
        positionCSS = `
            transform-origin : left bottom;
            left: 0;
            top: 80%;
        `;
    }

    const surveyURL = `${process.env.CLIENT_URL}share/survey/${surveyId}?embed=true`;

    return `
    // Create the button
    var feedbackButton = document.createElement('button');
    feedbackButton.id = 'feedback-button';
    feedbackButton.textContent = 'Feedback';
    document.body.appendChild(feedbackButton);

    // Create the modal
    var feedbackModal = document.createElement('div');
    feedbackModal.id = 'feedback-modal';
    //<div class="close-modal">X</div>
    feedbackModal.innerHTML = '<div><iframe style="width : 100%;min-height : 400px;" src="${surveyURL}" ></iframe></div>';
    document.body.appendChild(feedbackModal);

    // Create the modal background
    var modalBackground = document.createElement('div');
    modalBackground.id = 'modal-background';
    document.body.appendChild(modalBackground);

    // Add styles
    var styles = \`
        #feedback-button {
            position: fixed;
            padding: 5px;
            background-color: ${surveyConfig.button_color || '#006dff'};
            color: ${surveyConfig.button_text_color || '#ffffff'};
            cursor: pointer;
            border: none;
            border-radius: 3px;
            transform: translateY(-50%) rotate(90deg);
            transition: 'all 0.5s ease 0s';
            z-index: 1000;
            ${positionCSS}
        }

        #feedback-modal {
            display: none;
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            border: 1px solid #ccc;
            box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            width : 50%;
            border-radius : 5px;
        }

        #modal-background {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        .close-modal {
            float: right;
            cursor: pointer;
            width: 100%;
            padding: 5px 10px;
            text-align: right;
            color: ${surveyConfig.button_text_color || '#ffffff'};
            background: ${surveyConfig.button_color || '#006dff'};
        }

        @media screen and (max-width: 800px) {
            #feedback-modal {
                display: none;
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                border: 1px solid #ccc;
                box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                width : 95%;
                border-radius : 5px;
            }
        }

    \`;

    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    let isOpen = false;
    // Show the modal when the feedback button is clicked
    feedbackButton.onclick = function() {
        if(isOpen === false){
            feedbackModal.style.display = 'block';
            modalBackground.style.display = 'block';
            isOpen = true;
        }else{
            feedbackModal.style.display = 'none';
            modalBackground.style.display = 'none';
            isOpen = false;
        }
    };

    // Close modal when the close button or background is clicked
    document.querySelector('.close-modal').onclick = 
    modalBackground.onclick = function() {
        feedbackModal.style.display = 'none';
        modalBackground.style.display = 'none';
        isOpen = false;
    };

    // Close modal on ESC key
    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            feedbackModal.style.display = 'none';
            modalBackground.style.display = 'none';
        }
    };
    `;
}