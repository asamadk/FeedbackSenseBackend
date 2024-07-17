import { Edge, Node } from "./FlowTypes"

export type surveyTheme = {
    id : number,
    header : string,
    text : string,
    color : string[],
    textColor : string
}

export type surveyFlowType = {
    nodes : Node[],
    edges : Edge[],
    viewport : any
}

export type logicType = {
    id : string,
    operator : string,
    value : string,
    path : string,
    showValue ?: boolean
}

type Condition = {
    condition: string;
    uId: string;
    value ?:string;
};

export interface LiveSurveyNodes {
    uId: string;
    data: string;
    paths: Condition[];
    isStartingNode : boolean
}

export type filterResponse = {
    questionId: string;
    questionText: string;
    questionType: 'choice' | 'choice' | 'smiley' | 'rating';
    operators: FilterOperator[];
    answers: any[];
}

export type FilterPayloadType = {
    id: string,
    questionId: string,
    question: string,
    operator: FilterOperator,
    value: string,
    logicOperator: 'and' | 'or'
}

export type FilterOperator = 'equals' | 'does not equals' | 'is' | 'is not' | 'is between';