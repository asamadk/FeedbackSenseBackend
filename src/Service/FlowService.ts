import { logger } from "../Config/LoggerConfig";
import { PUBLISH_AUTOMATION_COUNT } from "../Constants/CustomSettingsCont";
import { Flow, flowTypes } from "../Entity/FlowEntity";
import { Workflow } from "../Entity/WorkflowEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { cleanSurveyFlowJSON, validateIsNodeDisconnected, validateLogicEdge, validateSurveyFlowOnSave } from "../Helpers/SurveyUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAutomationFlows = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flows fetched.');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const flows = await Repository.getFlow().find({
            where: { organization: { id: userInfo.organization_id } },
            order: { is_published: 'DESC',type : 'ASC' },
            select: {
                user: {
                    name: true
                }
            },
            relations: { user: true }
        });
        response.data = flows;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const createAutomationFlows = async (name: string, type: flowTypes): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow created.');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const toCreateFlow = new Flow();
        toCreateFlow.name = name;
        toCreateFlow.is_archived = false;
        toCreateFlow.is_deleted = false;
        toCreateFlow.is_published = false;
        toCreateFlow.organization = userInfo.organization_id as any;
        toCreateFlow.user_id = userInfo.id;
        toCreateFlow.type = type;
        await Repository.getFlow().save(toCreateFlow);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getAutomationFlowById = async (flowId: string | null): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow fetched.');
        const flow = await Repository.getFlow().findOne({
            where: { id: flowId },
            order: { is_published: 'ASC',type : 'ASC' },
            relations: { workflows: true }
        });
        response.data = flow;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateAutomationFlow = async (reqBody: Flow): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Name Updated.');
        await Repository.getFlow().save(reqBody);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateAutomationFlowJSON = async ({ flowId, flowJSON }: { flowId: string, flowJSON: string }): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow Updated.');
        flowJSON = cleanSurveyFlowJSON(flowJSON);

        const flowRepo = Repository.getFlow();

        const flow = await flowRepo.findOneBy({ id: flowId });
        const workflowId = flow.workflow_id;

        if (workflowId == null || workflowId === '') {
            const flowObj: Workflow = await createFlowWorkflow(flowJSON, flowId);
            flow.workflow_id = flowObj.id;
            await flowRepo.save(flow);
        } else {
            await updateFlowWorkflow(flowJSON, workflowId);
        }

        const validated = validateSurveyFlowOnSave(JSON.parse(flowJSON));
        if (validated != null) {
            response.message = `Saved: ${validated}`;
        }

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const createFlowWorkflow = (json: string, flowId: string): Promise<Workflow> => {
    const flowRepository = Repository.getWorkflow();
    const flowObj = new Workflow();
    flowObj.json = json
    flowObj.flowId = flowId;
    flowObj.surveyId = null;
    return flowRepository.save(flowObj);
}

const updateFlowWorkflow = async (json: string, flowId: string): Promise<Workflow> => {
    const flowRepository = Repository.getWorkflow();
    const flowObj = await flowRepository.findOneBy({ id: flowId });
    flowObj.json = json;
    flowObj.surveyId = null;
    return flowRepository.save(flowObj);
}

export const publishAutomationFlow = async (flowId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow published.');
        const workflowRepo = Repository.getWorkflow();
        const workflowObj = await workflowRepo.findOneBy({ flowId: flowId });
        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        if (workflowObj == null) {
            throw new Error('Cannot publish. Flow is empty.');
        }

        const workflowJSON = JSON.parse(workflowObj.json);
        const isSurveyFlowValid = validateSurveyFlowOnSave(workflowJSON);
        const isNodeDisconnected = validateIsNodeDisconnected(workflowJSON);
        const areEdgeCorrectlyDefined = validateLogicEdge(workflowJSON);

        if (isNodeDisconnected === true) {
            throw new Error('Please make sure all components are connected.');
        }

        if (isSurveyFlowValid != null) {
            throw new Error(isSurveyFlowValid);
        }

        if (areEdgeCorrectlyDefined != null) {
            throw new Error(areEdgeCorrectlyDefined);
        }

        const flowRepo = Repository.getFlow();
        const flow = await flowRepo.findOneBy({ id: flowId });

        await CustomSettingsHelper.getInstance().initialize(userInfo.organization_id);
        let totalCustomerLimit :any = CustomSettingsHelper.getInstance().getCustomSettings(PUBLISH_AUTOMATION_COUNT);
        const publishCount = await flowRepo.count({
            where : {
                organization : {
                    id : userInfo.organization_id
                },
                type : flow.type,
                is_published : true
            }
        });

        if(publishCount >= totalCustomerLimit){
            throw new Error('You have reached you limit, Please contact support to increase published flows.');
        }
        
        flow.is_published = true;
        await flowRepo.save(flow);
        response.data = flow;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const unPublishAutomationFlow = async (flowId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow unpublished.');
        const flowRepo = Repository.getFlow();
        const flow = await flowRepo.findOneBy({ id: flowId });
        flow.is_published = false;
        await flowRepo.save(flow);
        response.data = flow;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteAutomationFlow = async (flowId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Flow deleted.');
        const flowRepo = Repository.getFlow();
        await flowRepo.delete({
            id : flowId
        });
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}