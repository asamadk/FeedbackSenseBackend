import { logger } from "../Config/LoggerConfig";
import { FilterPayloadType, filterResponse } from "../Types/SurveyTypes";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";
import { WorkflowParser } from "./WorkflowParser";

export class FilterHelper{

    static getFilterDataFromSurvey(flowJSON : string):filterResponse[]{
        const res :filterResponse[] = [];
        const workflowParser = new WorkflowParser(flowJSON);
        const componentList = workflowParser.getCleanComponentData();
        const components = this.getFilterableComponent(componentList);

        components.forEach(comp => {
            const compConfig = comp.compConfig != null ? JSON.parse(comp.compConfig) : {};
            if(comp.compId === 3 || comp.compId === 4 || comp.compId === 6){
                if(comp.compId === 6){
                    compConfig.answerList = ['Extremely Unsatisfied','Unsatisfied','Neutral','Happy','Extremely Happy'];
                }
                res.push({
                    questionId : comp.uId,
                    questionType : comp.compId === 6 ? 'smiley' : 'choice',
                    questionText : compConfig.question,
                    answers : compConfig.answerList,
                    operators : ['equals','does not equals']
                });
            }else if(comp.compId === 7) {
                res.push({
                    questionId : comp.uId,
                    questionType : 'rating',
                    questionText : compConfig.question,
                    answers : this.generateNumberArray(compConfig.range),
                    operators : ['is','is not']
                });
            }
        })
        return res;
    }

    static generateNumberArray(n : number) {
        const result : number[] = [];
        for (let i = 1; i <= n; i++) {
          result.push(i);
        }
        return result;
    }

    static getFilterableComponent(componentList : any[]){
        const returnList = [];
        const filterableComponentSet : Set<number> = this.getFilterableComponentIds();
        componentList.forEach(comp => {
            if(filterableComponentSet.has(comp.compId) === true){
                returnList.push(comp);
            }
        })
        return returnList;
    }

    static getFilterableComponentIds():Set<number>{
        const filterableComponentSet = new Set<number>();
        filterableComponentSet.add(3);
        filterableComponentSet.add(4);
        filterableComponentSet.add(6);
        filterableComponentSet.add(7);
        return filterableComponentSet;
    }

    static doesResponseSatisfiesCondition(response : any[],filterPayload : FilterPayloadType[]):boolean{
        if(filterPayload == null || filterPayload.length < 1){return true;}
        const responseBooleans :boolean[] = [];

        for(const payload of filterPayload){
            const questionId = payload.questionId;
            const matchingResponse = response.find((item) => item.uiId === questionId);
            if(matchingResponse == null){
                // logger.error(`
                //     Matching response not found for given payload data.`);
                // throw new Error('Something went wrong, Please contact support.');
                responseBooleans.push(false);
                continue;
            }
            const matched = this.matchQuestion(payload,matchingResponse);
            responseBooleans.push(matched);            
        }
        return this.applyFilterLogic(filterPayload,responseBooleans);
    }

    static matchQuestion(payload :FilterPayloadType,response : any):boolean{
        if(response.id === 3){
            const answer :string = response.data.selectedVal;
            if(payload.operator === 'equals'){
                return answer === payload.value;
            }else{
                return answer != payload.value;
            }
        }else if(response.id === 4){
            const answers : string[] = response.data.selectedVal;
            if(payload.operator === 'equals'){
                return answers.includes(payload.value);
            }else{
                return !answers.includes(payload.value);
            }
        }else if(response.id === 6){
            const emojiId : string = response.data.emojiId;
            const emojiList = ['Extremely Unsatisfied','Unsatisfied','Neutral','Happy','Extremely Happy'];
            if(payload.operator === 'equals'){
                return payload.value.toLowerCase() === emojiList[parseInt(emojiId)].toLowerCase();
            }else{
                return payload.value.toLowerCase() !== emojiList[parseInt(emojiId)].toLowerCase();
            }
        }else if(response.id === 7){
            const rating : number = response.data.value;
            const payloadValue : number = typeof payload.value === 'string' ? parseInt(payload.value) : payload.value;
            if(payload.operator === 'is'){
                return rating === payloadValue;
            }else{
                return rating !== payloadValue;
            }
        }
        return true;
    }

    static applyFilterLogic(
        filterPayload: FilterPayloadType[],
        booleanResults: boolean[]
    ): boolean {
        if (filterPayload.length !== booleanResults.length) {
            throw new Error('Error in applyFilterLogic,Payload & BooleanResult arrays must have the same length.');
        }
        let result = booleanResults[0];
    
        for (let i = 1; i < filterPayload.length; i++) {
            const { logicOperator } = filterPayload[i - 1];
            if (logicOperator === 'and') {
                result = result && booleanResults[i];
            } else if (logicOperator === 'or') {
                result = result || booleanResults[i];
            }
        }
        return result;
    }

}