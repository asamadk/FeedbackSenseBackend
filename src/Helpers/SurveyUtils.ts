import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { Subscription } from "../Entity/SubscriptionEntity";
import { SurveyConfig } from "../Entity/SurveyConfigEntity";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { LiveSurveyNodes, logicType } from "../Types/SurveyTypes";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";
import { answerNotNeededSet } from "./Constants";
import { CustomSettingsHelper } from "./CustomSettingHelper";

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

// export const sortSurveyFlowNodes = (nodes: any[], edges: any[]): LiveSurveyNodes[] => {

//     // Helper function to check if a node is a starting node
//     const isStartingNode = (nodeId: string) => {
//         return !edges.some(edge => edge.target === nodeId);
//     };

//     return nodes.map(node => {
//         const compConfig = JSON.parse(node.data.compConfig);
//         const logic : any[] = compConfig.logic || [];
//         const connectedEdges = edges.filter(edge => edge.source === node.id);
//         let paths = [];
//         if (logic.length > 0) {
//             paths = connectedEdges.map(edge => ({
//                 condition: (logic.find((logItem: any) => logItem.path === edge.label) || {}).operator || "default",
//                 value: (logic.find((logItem: any) => logItem.path === edge.label) || {}).value || "",
//                 uId: edge.target
//             }));
//         } else if (connectedEdges.length > 0) {
//             paths.push({
//                 condition: "default",
//                 uId: connectedEdges[0].target
//             });
//         }

//         return {
//             uId: node.id,
//             data: node.data,
//             paths: paths,
//             isStartingNode: isStartingNode(node.id)
//         };
//     });
// };

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
    const orgId = userDetails.organization_id;
    await CustomSettingsHelper.getInstance(orgId).initialize();
    const surveyResponseCapacity = CustomSettingsHelper.getInstance(orgId).getCustomSettings(SURVEY_RESPONSE_CAPACITY);
    return parseInt(surveyResponseCapacity);
}

export const createSurveyConfig = async (userId: string, surveyId: string) => {
    const surveyConfigRepo = AppDataSource.getDataSource().getRepository(SurveyConfig);

    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const orgId = userDetails.organization_id;
    await CustomSettingsHelper.getInstance(orgId).initialize();
    const surveyResponseCapacity = CustomSettingsHelper.getInstance(orgId).getCustomSettings(SURVEY_RESPONSE_CAPACITY);

    await surveyConfigRepo.save({
        response_limit: parseInt(surveyResponseCapacity),
        time_limit: null,
        survey_id: surveyId,
    })

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