import { recordType } from "../../Types/ApiTypes";
import { Node } from "../../Types/FlowTypes";
import { BaseComponent } from "./BaseComponent";
import { BatchContext } from "./BatchContext";
import { AssignOwnerNode } from "./Nodes/AssignOwnerNode";
import { CreateTaskNode } from "./Nodes/CreateTaskNode";
import { SendEmailNode } from "./Nodes/SendEmailNode";
import { SendSurveyNode } from "./Nodes/SendSurveyNode";
import { TriggerNode } from "./Nodes/TriggerNode";
import { UpdateRecordNode } from "./Nodes/UpdateRecordNode";
import { WaitForNode } from "./Nodes/WaitForNode";

export class NodeFactory {

    private batchContext: BatchContext;

    constructor(batchContext: BatchContext) {
        this.batchContext = batchContext;
    }

    getNodeInstance(node: Node, recordType: recordType): BaseComponent {
        switch (node.data.compId) {
            case 15:
                return new TriggerNode(recordType, node.data, this.batchContext);
            case 16:
                return new TriggerNode(recordType, node.data, this.batchContext);
            case 18:
                return new WaitForNode(recordType, node.data, this.batchContext);
            case 19:
                return new CreateTaskNode(recordType, node.data, this.batchContext);
            case 20:
                return new SendEmailNode(recordType, node.data, this.batchContext);
            case 21:
                return new AssignOwnerNode(recordType, node.data, this.batchContext);
            case 22:
                return new UpdateRecordNode(recordType, node.data, this.batchContext);
            case 24:
                return new SendSurveyNode(recordType, node.data, this.batchContext);
        }
    }
}