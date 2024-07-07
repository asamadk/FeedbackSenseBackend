import { AppDataSource } from "../Config/AppDataSource";
import { SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { Survey } from "../Entity/SurveyEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { User } from "../Entity/UserEntity";
import { LiveSurveyNodes, logicType } from "../Types/SurveyTypes";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";
import { answerNotNeededSet } from "./Constants";
import { CustomSettingsHelper } from "./CustomSettingHelper";

export const cleanSurveyFlowJSON = (surveyJSON: string): string => {
    if (surveyJSON == null || surveyJSON.length < 1) {
        return surveyJSON;
    }
    const surveyFlowData = JSON.parse(surveyJSON);
    const surveyComponentIds = new Set<string>();
    surveyFlowData?.nodes?.forEach((node: any) => {
        surveyComponentIds.add(node.id);
    });
    const newFlowEdges = [];
    const currentEdges: any[] = surveyFlowData?.edges;
    currentEdges.forEach(edge => {
        if (surveyComponentIds.has(edge.source) || surveyComponentIds.has(edge.target)) {
            newFlowEdges.push(edge);
        }
    });
    surveyFlowData.edges = newFlowEdges;
    return JSON.stringify(surveyFlowData);
}

export const sortSurveyFlowNodes = (nodes: any[], edges: any[]): LiveSurveyNodes[] => {

    // Helper function to check if a node is a starting node
    const isStartingNode = (nodeId: string) => {
        return !edges.some(edge => edge.target === nodeId);
    };

    // Helper function to extract path details from edge and logic
    const getPathDetails = (edge: any, logItem: any) => {
        return {
            condition: logItem.operator || "default",
            value: logItem.value || "",
            uId: edge.target
        };
    };

    return nodes.map(node => {
        const compConfig = JSON.parse(node.data.compConfig);
        const logic: any[] = compConfig.logic || [];
        const connectedEdges = edges.filter(edge => edge.source === node.id);
        const paths = [];

        if (logic.length > 0) {
            for (const logItem of logic) {
                const matchedEdge = connectedEdges.find(edge => edge.label === logItem.path);
                if (matchedEdge) {
                    paths.push(getPathDetails(matchedEdge, logItem));
                }
            }
            // Add default paths for edges not covered in logic
            for (const edge of connectedEdges) {
                if (!paths.some(path => path.uId === edge.target)) {
                    paths.push({
                        condition: "default",
                        uId: edge.target
                    });
                }
            }
        } else if (connectedEdges.length > 0) {
            paths.push({
                condition: "default",
                uId: connectedEdges[0].target
            });
        }

        return {
            uId: node.id,
            data: node.data,
            paths: paths,
            isStartingNode: isStartingNode(node.id)
        };
    });
};


export const getPercentage = (partialValue: number, totalValue: number): string => {
    const percentage = (100 * partialValue) / totalValue;
    return percentage.toFixed();
}

export const isSurveyEnded = (timeLimit: string): boolean => {
    if (timeLimit == null) {
        return false;
    }
    const dateString = timeLimit;
    const targetDate = new Date(dateString);
    const today = new Date();
    // Remove the time portion from both dates to compare only the dates
    const targetDateWithoutTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (targetDateWithoutTime < todayWithoutTime) {
        return true;
    }
    return false;
}

export const hasSurveyReachedResponseLimit = async (resLimit: number, surveyId: string): Promise<boolean> => {
    if (resLimit == null || resLimit === 0) {
        return false;
    }
    const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);
    const surveyResponseCount = await surveyResponseRepo.count({ where: { survey_id: surveyId } })
    if (surveyResponseCount >= resLimit) {
        return true;
    }
    return false;
}

export async function getCountOfSurveysForOrganizationByMonth(organizationId: string, surveyId: string) {
    const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);

    // Calculate the date range for the current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        // Construct the query
        const count = await surveyResponseRepo
            .createQueryBuilder('response')
            .innerJoin(Survey, 'survey', 'survey.id = response.survey_id')
            .innerJoin(User, 'user', 'user.id = survey.user_id')
            .where('response.created_at >= :firstDayOfMonth', { firstDayOfMonth })
            .andWhere('response.created_at <= :lastDayOfMonth', { lastDayOfMonth })
            .andWhere('user.organization_id = :organizationId', { organizationId })
            .andWhere('survey.is_published = true')
            .getCount();

        return count;
    } catch (error) {
        // Handle any errors here
        console.error('Error:', error);
        return 0; // Return 0 or an appropriate error indicator
    }
}

export const getMaxResponseLimit = async () => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const orgId = userDetails.organization_id;
    await CustomSettingsHelper.getInstance().initialize(orgId);
    const surveyResponseCapacity = CustomSettingsHelper.getInstance().getCustomSettings(SURVEY_RESPONSE_CAPACITY);
    return parseInt(surveyResponseCapacity);
}

export const createSurveyConfig = async (userId: string, surveyId: string) => {
    const surveyConfigRepo = AppDataSource.getDataSource().getRepository(SurveyConfig);

    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const orgId = userDetails.organization_id;
    await CustomSettingsHelper.getInstance().initialize(orgId);
    const surveyResponseCapacity = CustomSettingsHelper.getInstance().getCustomSettings(SURVEY_RESPONSE_CAPACITY);

    await surveyConfigRepo.save({
        response_limit: parseInt(surveyResponseCapacity),
        time_limit: null,
        survey_id: surveyId,
    });
}

export const validateSurveyFlowOnSave = (flow: any): string | null => {
    const nodes: any[] = flow?.nodes;
    for (const node of nodes) {
        if (node == null || node.data == null) {
            continue;
        }
        if (node?.data?.compConfig == null) {
            node.data.compConfig = '{}'
        }
        const isValidated = validateFlowComponent(JSON.parse(node?.data?.compConfig), node.data.compId);
        const componentLogicValidate = validateComponentLogic(JSON.parse(node?.data?.compConfig), node.data.compId);
        if (isValidated != null) {
            return isValidated;
        } else if (componentLogicValidate != null) {
            return componentLogicValidate;
        }
    }
    return null;
}

export const validateLogicEdge = (flow: any): string | null => {
    const edges: any[] = flow.edges;
    const nodes: any[] = flow.nodes;

    const nodeEdgeMap = {};

    edges?.forEach(edge => {
        if (!nodeEdgeMap[edge.source]) {
            nodeEdgeMap[edge.source] = [];
        }
        nodeEdgeMap[edge.source].push(edge);
    });

    for (const node of nodes) {
        const compConfigStr: string | null = node?.data?.compConfig;
        if (compConfigStr == null || compConfigStr.length < 1) { continue; }
        const compConfig = JSON.parse(compConfigStr);
        const logics: logicType[] = compConfig.logic;
        if (logics == null || logics?.length < 1) {
            const nodeEdges: any[] = nodeEdgeMap[node.id];
            if (nodeEdges?.length > 1) {
                return 'Each component without logic should have only one connecting edge.';
            }
        } else {
            const nodeEdges: any[] = nodeEdgeMap[node.id];
            if (nodeEdges == null || nodeEdges.length < 1) {
                return 'A component with logic requires connected nodes.';
            }
            const logicPaths = new Set<string>();
            logicPaths.add('default');
            logics.forEach(logic => {
                logicPaths.add(logic.path);
            });
            if (nodeEdges.length !== logicPaths.size) {
                return 'Complete all logic connections before proceeding.';
            }
            for (const nodeEdge of nodeEdges) {
                const path: string = nodeEdge.label;
                if (path == null || path.length < 1) {
                    return 'Ensure all logic-based edges have a designated path name.';
                }
                if (logicPaths.has(path) == false) {
                    return 'Ensure all logic-based edges have a designated path.';
                }
            }
        }
    }
    return null;
}

export const validateIsNodeDisconnected = (flow: any): boolean => {
    const uniqueNodeIds = new Set<string>();
    const edges: any[] = flow.edges;
    const nodes: any[] = flow.nodes;

    if (nodes != null && nodes.length === 1) { return false; }

    if ((edges === null || edges.length < 1) && (nodes != null && nodes.length > 0)) {
        return true;
    }

    if (edges === null || edges.length < 1) {
        return true;
    }

    for (const edge of edges) {
        uniqueNodeIds.add(edge.source);
        uniqueNodeIds.add(edge.target);
    }

    for (const node of nodes) {
        if (!uniqueNodeIds.has(node.id)) {
            return true;
        }
    }
    return false;
}

export const validateFlowComponent = (data: any, componentId: number | undefined): string | null => {
    switch (componentId) {
        case 1:
            if (data.welcomeText == null || data.welcomeText?.length < 1) {
                return 'Important: Don\'t forget to fill the required fields.'
            }

            if (data.buttonText == null || data.buttonText?.length < 1) {
                return 'Button text cannot be empty.';
            }
            break;
        case 3:
        case 4:
        case 11:
            if (data.question == null || data.question?.length < 1) {
                return 'Important: Don\'t forget to fill in the question field.'
            }
            if (data.answerList == null) {
                return 'Component should have at least one answer choice.'
            } else {
                const comChoiceList: string[] = data.answerList;
                for (const choice of comChoiceList) {
                    if (choice == null || choice.length < 1) {
                        return 'Important: Please fill in the answer fields.'
                    }
                }
            }
            break;
        case 5:
        case 13:
            if (data.question == null || data.question?.length < 1) {
                return 'Important: Don\'t forget to fill in the question field.'
            }
            break;
        case 6:
        case 7:
        case 8:
            if (data.question == null || data.question?.length < 1) {
                return 'Important: Don\'t forget to fill in the question field.'
            }

            break;
        case 14:
            return 'Important : Please update the selector node.';
        case 15:
        case 16:
            if (data.insertType === 'some') {
                const conditions: any[][] = data.conditionBlock || [[]];
                if (conditions.length < 1) { return 'Incorrect condition'; }
                if (conditions[0].length < 1) { return 'Incorrect condition'; }
                for (let i = 0; i < conditions.length; i++) {
                    const condition = conditions[i];
                    for (let j = 0; j < condition.length; j++) {
                        const singleCond = condition[j];
                        if (
                            singleCond == null ||
                            singleCond?.field == null || singleCond?.field.length < 1 ||
                            singleCond?.operator == null || singleCond?.operator.length < 1 ||
                            singleCond?.value == null || singleCond?.value.length < 1 ||
                            singleCond?.where == null || singleCond?.where.length < 1
                        ) {
                            return 'Incorrect condition'
                        }
                    }
                }
            }
            break;
        case 18:
            if (data?.days == null || data?.days === 0) {
                return 'Please select number of days.'
            }
            break;
        case 19:
            if (
                data == null ||
                data.title == null || data.title.length < 1 ||
                data.owner == null || data.owner.length < 1 ||
                data.priority == null || data.priority.length < 1 ||
                data.dueDate == null || data.dueDate.length < 1
            ) {
                return 'Please fill all the fields';
            }
            break;
        case 20:
            if (
                data == null ||
                data?.subject == null || data?.subject?.length < 1 ||
                data?.body == null || data?.body?.length < 1
            ) {
                return 'Please fill all the fields';
            }
            break;
        case 21:
            if (data?.owner == null || data?.owner.length < 1) {
                return 'Please select an owner.';
            }
            break;
        case 22:
            if (data.fields == null || data.fields.length < 1) { return 'Incorrect values'; }
            const fields: { field: string, value: string }[] = data.fields;
            for (let i = 0; i < fields.length; i++) {
                const tmp = fields[i];
                if (
                    tmp.field == null || tmp.field.length < 1 ||
                    tmp.value == null || tmp.value.length < 1
                ) {
                    return 'Please fill all the value';
                }
            }
            break;
        case 24:
            if (data.survey == null || data.survey.length < 1) {
                return 'Please select a survey';
            }
            break;
        default:
            break;
    }
    return null;

}

export const validateComponentLogic = (data: any, componentId: number | undefined): string | null => {
    const logics: logicType[] = data?.logic;
    const answerList: string[] = data?.answerList;
    const range: number = data?.range;
    if (logics == null || logics.length < 1) { return null }
    for (let i = 0; i < logics.length; i++) {
        const logic = logics[i];
        switch (componentId) {
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 13:
                {
                    if (!logic.operator) {
                        return 'Essential: Please specify the logic operator.';
                    }
                    if (!logic.path) {
                        return 'Essential: Please define the logic path.';
                    }
                    if (componentId === 3 || componentId === 4) {
                        if ((!logic.value || !answerList?.includes(logic.value)) && !answerNotNeededSet.has(logic.operator)) {
                            return 'Essential: Specify a valid logic value from the available answers.';
                        }
                    }

                    if (componentId === 5 || componentId === 6 || componentId === 8) {
                        if ((!logic.value) && !answerNotNeededSet.has(logic.operator)) {
                            return 'Essential: Specify a valid logic value from the available answers.';
                        }
                    }
                    if (componentId === 7) {
                        if ((!logic.value || parseInt(logic.value) > range) && !answerNotNeededSet.has(logic.operator)) {
                            return 'Essential: Specify a valid logic value from the available answers.';
                        }
                    }
                    break;
                }
        }
    }
    const hasDuplicates = hasDuplicateLogic(logics);
    if (hasDuplicates === true) {
        return 'Important : Component contains duplicate logic.'
    }
    return null;
}

function hasDuplicateLogic(logicObjects: logicType[]): boolean {
    if (logicObjects == null || logicObjects.length < 1) { return false }
    const serializedObjects = logicObjects.map(obj => JSON.stringify({
        operator: obj.operator,
        value: obj.value,
        path: obj.path,
        showValue: obj.showValue
    }));
    const uniqueObjects = new Set(serializedObjects);
    return serializedObjects.length !== uniqueObjects.size;
}