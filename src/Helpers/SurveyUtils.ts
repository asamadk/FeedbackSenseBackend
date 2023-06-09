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

const getSubscriptionLimit = (userSubscription : Subscription) => {
    const subLimit = userSubscription.sub_limit;
    if(subLimit == null || subLimit.length < 1){
        logger.error('User subscription has no sub_limit.');
        throw 'User subscription has no sub_limit.';
    }
    return JSON.parse(subLimit);
}

export const getMaxResponseLimit = async () => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const userEmail = userDetails?._json?.email;

    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const userSubscription = await subscriptionRepo.findOne({where : {user : {email : userEmail}}});
    const subLimitObj = getSubscriptionLimit(userSubscription);
    const responseCapacity = subLimitObj?.responseCapacity;
    return parseInt(responseCapacity);
}

export const createSurveyConfig = async (userId : string,surveyId : string) => {
    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const surveyConfigRepo = getDataSource(false).getRepository(SurveyConfig);

    const userSubscription = await subscriptionRepo.findOne({where : {user : {id : userId}}});
    const subLimitObj = getSubscriptionLimit(userSubscription);

    let responseCapacity = subLimitObj?.responseCapacity;
    if(responseCapacity == null){
        responseCapacity = 0;
    }

    await surveyConfigRepo.save({
        response_limit : parseInt(responseCapacity),
        time_limit : null,
        survey_id : surveyId,
    })

}