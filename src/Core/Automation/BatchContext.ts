import { recordType } from "../../Types/ApiTypes";
import { EmailInteract } from "./Interactors/EmailInteract";
import { TaskInteract } from "./Interactors/TaskInteractor";
import { WaitRecordInteract } from "./Interactors/WaitRecordInteract";
import { WorkflowInteract } from "./Interactors/WorkflowInteractor";
import { NodeFactory } from "./NodeFactory";

export class BatchContext{

    flowId :string;
    orgId :string;
    recordType :recordType;

    workflowInteract :WorkflowInteract;
    taskInteract: TaskInteract;
    emailInteract :EmailInteract;
    waitRecordInteract :WaitRecordInteract;
    nodeFactory :NodeFactory;


    constructor(flowId :string,orgId :string,recordType :recordType){
        this.flowId = flowId;
        this.orgId = orgId;
        this.recordType = recordType;
        this.initializeContext();
    }

    initializeContext(){
        this.nodeFactory = new NodeFactory(this);
        this.workflowInteract = new WorkflowInteract(this.recordType);
        this.taskInteract = new TaskInteract();
        this.emailInteract = new EmailInteract(this.recordType,this.orgId);
        this.waitRecordInteract = new WaitRecordInteract();
    }

}