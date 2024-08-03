import { logger } from "../../Config/LoggerConfig";
import { Flow } from "../../Entity/FlowEntity";
import { surveyFlowType } from "../../Types/SurveyTypes";
import { getDateFromLiteral } from "../DateTimeUtils";

export function parseDataType(value: string): number | Date | boolean | string {
    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
        return numberValue;
    }
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
        dateValue.setUTCHours(0, 0, 0, 0);
        return dateValue;
    }
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') {
        return true;
    } else if (lowerValue === 'false') {
        return false;
    }
    return value;
}

function parseExpectedValue(actualValue: string | number | Date | boolean, expectedValue: any) {
    if (typeof actualValue === 'number' || typeof actualValue === 'boolean') {
        return parseDataType(expectedValue);
    }
    const dateValue = new Date(actualValue);
    if (!isNaN(dateValue.getTime())) {
        return getDateFromLiteral(expectedValue);
    } else {
        return expectedValue;
    }
}

export function getTriggerCondition(flowJSON: surveyFlowType) {
    const nodes = flowJSON.nodes;
    const triggerNode = getTriggerNode(nodes);
    const compConfigStr = triggerNode?.data?.compConfig;
    const compConfig = JSON.parse(compConfigStr);
    const condition = compConfig?.conditionBlock;
    const insertType = compConfig?.insertType;
    if (insertType !== 'some') { return null; }
    return condition;
}

export function getTriggerNode(nodes: any[]) {
    let triggerNode: any = {};
    nodes.forEach(node => {
        if (node?.data?.compId === 15 || node?.data?.compId === 16) {
            triggerNode = node;
        }
    });
    return triggerNode;
}

export function recordMatchCondition(flowJSONStr: string, record: any) :boolean {
    const flowJSON: surveyFlowType = JSON.parse(flowJSONStr);
    const conditionArr: any[][] = getTriggerCondition(flowJSON);
    if (conditionArr == null) { return true; }
    const conditionResult: boolean[] = [];
    let finalResult = false;
    conditionArr.forEach(conditions => {
        conditions.forEach(condition => {
            const recordValue = record[condition.field];
            const operator = condition.operator;
            const expectedValue = condition.value;
            const actualRecordValue = parseDataType(recordValue);
            const expectedRecordValue = parseExpectedValue(actualRecordValue, expectedValue);

            switch (operator) {
                case 'Equal':
                    if (actualRecordValue instanceof Date && expectedRecordValue instanceof Date) {
                        conditionResult.push(actualRecordValue.getTime() === expectedRecordValue.getTime());
                        break;
                    }
                    conditionResult.push(actualRecordValue === expectedRecordValue);
                    break;
                case 'Not Equals':
                    if (actualRecordValue instanceof Date && expectedRecordValue instanceof Date) {
                        conditionResult.push(actualRecordValue.getTime() !== expectedRecordValue.getTime());
                        break;
                    }
                    conditionResult.push(actualRecordValue != expectedRecordValue);
                    break;
                case 'Less Than':
                    conditionResult.push(actualRecordValue < expectedRecordValue);
                    break;
                case 'Greater Than':
                    conditionResult.push(actualRecordValue > expectedRecordValue);
                    break;
                case 'Less Than or Equal':
                    conditionResult.push(actualRecordValue <= expectedRecordValue);
                    break;
                case 'Greater Than or Equal':
                    conditionResult.push(actualRecordValue >= expectedRecordValue);
                    break;
                case 'Contains':
                    if (typeof actualRecordValue === 'string' && typeof expectedRecordValue === 'string') {
                        conditionResult.push(actualRecordValue.includes(expectedRecordValue));
                        break;
                    }
                    conditionResult.push(false);
                    break;
                default:
                    throw new Error(`Unsupported operator: ${operator}`);
            }
        });
        
        finalResult = conditionResult[0];
        for (let i = 1; i < conditions.length; i++) {
            const condition = conditions[i];
            if (condition.where === 'AND') {
                finalResult = finalResult && conditionResult[i];
            } else if (condition.where === 'OR') {
                finalResult = finalResult || conditionResult[i];
            }
        }
    });
    return finalResult;
}
