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