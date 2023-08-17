import { AppDataSource } from "../Config/AppDataSource";
import { Templates } from "../Entity/TemplateEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { USER_UNAUTH_TEXT } from "../Helpers/Constants";
import { getDefaultResponse } from "../Helpers/ServiceUtils"
import { sortSurveyFlowNodes } from "../Helpers/SurveyUtils";
import { responseRest } from "../Types/ApiTypes"
import { surveyFlowType } from "../Types/SurveyTypes";
import { surveyTheme } from "../Types/SurveyTypes";
import { createSurvey, saveSurveyFlow } from "./SurveyService";

export const getTemplateDetails = async (): Promise<responseRest> => {
    const response = getDefaultResponse('Templates fetched successfully.');
    const templateRepo = AppDataSource.getDataSource().getRepository(Templates);
    const templates = await templateRepo.find();
    response.data = templates;
    return response;
}

export const getTemplateTestDisplay = async (templateId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Templates display fetched successfully.');
    const templateRepo = AppDataSource.getDataSource().getRepository(Templates);
    const template = await templateRepo.findOne({ where: { id: templateId } });

    if (template == null) {
        throw new Error('Template not found.')
    }

    const templateDesignStr: string = template.design_json;
    const templateDesign: surveyTheme = JSON.parse(templateDesignStr)?.theme;
    const templateBackground = JSON.parse(templateDesignStr)?.background;
    const templateDetail: surveyFlowType = JSON.parse(template.data);

    const resData = {
        background: templateBackground,
        theme: templateDesign,
        nodes: sortSurveyFlowNodes(templateDetail.nodes, templateDetail.edges)
    }
    response.data = resData;
    return response;
}

export const createSurveyFromTemplate = async (templateId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Survey created successfully.');
    const templateRepo = AppDataSource.getDataSource().getRepository(Templates);
    const user = AuthUserDetails.getInstance().getUserDetails();

    if (user == null) {
        throw new Error(USER_UNAUTH_TEXT);
    }

    const template = await templateRepo.findOne({ where: { id: templateId } });
    if (template == null) {
        throw new Error('Template not found.');
    }
    const surveyName = `${template.name} - Template ${new Date().toLocaleString()}`;
    const res = await createSurvey(surveyName, user);
    if (res.data.id == null) {
        throw new Error('Cannot create survey at this moment.');
    }
    await saveSurveyFlow(res?.data?.id, template.data, false);
    response.data = {
        surveyId: res.data.id
    }
    return response;
}