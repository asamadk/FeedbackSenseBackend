import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Subscription } from "../Entity/SubscriptionEntity";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";

export const cleanSurveyFlowJSON = (surveyJSON: string): string => {
    if (surveyJSON == null || surveyJSON.length < 1) {
        return surveyJSON;
    }
    const suveyFlowData = JSON.parse(surveyJSON);
    const surveyComponentIds = new Set<string>();
    suveyFlowData?.nodes?.forEach((node: any) => {
        surveyComponentIds.add(node.id);
    });
    const newFlowEdges = [];
    const currentEdges: any[] = suveyFlowData?.edges;
    currentEdges.forEach(edge => {
        if (surveyComponentIds.has(edge.source) || surveyComponentIds.has(edge.target)) {
            newFlowEdges.push(edge);
        }
    });
    suveyFlowData.edges = newFlowEdges;
    return JSON.stringify(suveyFlowData);
}

export const sortSurveyFlowNodes = (nodes: any[], edges: any[]): any[] => {
    const sortedNodes: any[] = [];
    const visitedNodes = new Set<string>();

    const traverse = (nodeId: string) => {
        if (visitedNodes.has(nodeId)) {
            return;
        }
        visitedNodes.add(nodeId);
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
            return;
        }
        const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
        for (const edge of outgoingEdges) {
            traverse(edge.target);
        }
        sortedNodes.unshift(node);
    };
    for (const edge of edges) {
        traverse(edge.source);
    }
    return sortedNodes;
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
    const surveyResponseRepo = getDataSource(false).getRepository(SurveyResponse);
    const surveyResponseCount = await surveyResponseRepo.count({ where: { survey_id: surveyId } })
    if (surveyResponseCount >= resLimit) {
        return true;
    }
    return false;
}

const getSubscriptionLimit = (userSubscription: Subscription) => {
    const subLimit = userSubscription.sub_limit;
    if (subLimit == null || subLimit.length < 1) {
        logger.error('User subscription has no sub_limit.');
        throw new Error('User subscription has no sub_limit.');
    }
    return JSON.parse(subLimit);
}

export const getMaxResponseLimit = async () => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const userEmail = userDetails?._json?.email;

    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const userSubscription = await subscriptionRepo.findOne({ where: { user: { email: userEmail } } });
    const subLimitObj = getSubscriptionLimit(userSubscription);
    const responseCapacity = subLimitObj?.responseCapacity;
    return parseInt(responseCapacity);
}

export const createSurveyConfig = async (userId: string, surveyId: string) => {
    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const surveyConfigRepo = getDataSource(false).getRepository(SurveyConfig);

    const userSubscription = await subscriptionRepo.findOne({ where: { user: { id: userId } } });
    const subLimitObj = getSubscriptionLimit(userSubscription);

    let responseCapacity = subLimitObj?.responseCapacity;
    if (responseCapacity == null) {
        responseCapacity = 0;
    }

    await surveyConfigRepo.save({
        response_limit: parseInt(responseCapacity),
        time_limit: null,
        survey_id: surveyId,
    })

}

export const validateSurveyFlowOnSave = (flow: any): boolean => {
    const nodes: any[] = flow?.nodes;
    for (const node of nodes) {
        if (node == null || node.data == null) {
            continue;
        }
        if (node?.data?.compConfig == null) {
            throw new Error('One or more components are have missing information.');
        }
        const validatedComp = validateFlowComponent(JSON.parse(node?.data?.compConfig), node.data.compId);
        if (validatedComp != null) {
            throw new Error(validatedComp);
        }
    }
    return true;
}

export const validateIsNodeDisconnected = (flow: any): boolean => {
    const uniqueNodeIds = new Set<string>();
    const edges: any[] = flow.edges;
    const nodes: any[] = flow.nodes;

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

const validateFlowComponent = (data: any, componentId: number | undefined): string | null => {
    switch (componentId) {
        case 1:
            if (data.welcomeText == null || data.welcomeText?.length < 1) {
                return 'Please fill in all required fields before saving.';
            }

            if (data.buttonText == null || data.buttonText?.length < 1) {
                return 'Button text cannot be empty.';
            }
            break;
        case 3:
        case 4:
        case 11:
            if (data.question == null || data.question?.length < 1) {
                return 'Question field cannot be empty.'
            }
            if (data.answerList == null) {
                return 'Component should have at least one answer choice.'
            } else {
                const comChoiceList: string[] = data.answerList;
                for (const choice of comChoiceList) {
                    if (choice == null || choice.length < 1) {
                        return 'Answer fields cannot be empty.'
                    }
                }
            }
            break;
        case 5:
        case 13:
            if (data.question == null || data.question?.length < 1) {
                return 'Question field cannot be empty.'
            }
            break;
        case 6:
        case 7:
        case 8:
            if (data.question == null || data.question?.length < 1) {
                return 'Question field cannot be empty.'
            }

            if (data.leftText == null || data.leftText?.length < 1) {
                return 'Left text field cannot be empty.'
            }

            if (data.rightText == null || data.rightText?.length < 1) {
                return 'Right text field cannot be empty.'
            }
            break;
        default:
            break;
    }
    return null;
}