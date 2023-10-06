export type surveyTheme = {
    id : number,
    header : string,
    text : string,
    color : string[],
    textColor : string
}

export type surveyFlowType = {
    nodes : any[],
    edges : any[],
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