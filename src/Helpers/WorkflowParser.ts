import { surveyFlowType } from "../Types/SurveyTypes";

export class WorkflowParser{

    private surveyJSON :surveyFlowType = {
        edges : [],
        nodes : [],
        viewport : {}
    };

    constructor(surveyJSONStr : string) {
        if(surveyJSONStr == null || surveyJSONStr.length < 1){return;}
        this.surveyJSON = JSON.parse(surveyJSONStr);
    }

    getWorkflowJSON(){
        return this.surveyJSON;
    }

    getComponentList(){
        return this.surveyJSON.nodes;
    }

    getWorkflowEdges(){
        return this.surveyJSON.edges;
    }

    getCleanComponentData(){
        const compData = [];
        const components = this.getComponentList();
        components.forEach(comp => {
            const data = comp?.data;
            compData.push(data);
        });
        return compData;
    }

}