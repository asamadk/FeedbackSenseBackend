import { recordType } from "../../Types/ApiTypes";
import { Node } from "../../Types/FlowTypes";
import { BaseComponent } from "./BaseComponent";
import { AssignOwnerNode } from "./Nodes/AssignOwnerNode";
import { CreateTaskNode } from "./Nodes/CreateTaskNode";
import { SendEmailNode } from "./Nodes/SendEmailNode";
import { SendSurveyNode } from "./Nodes/SendSurveyNode";
import { TriggerNode } from "./Nodes/TriggerNode";
import { UpdateRecordNode } from "./Nodes/UpdateRecordNode";
import { WaitForNode } from "./Nodes/WaitForNode";

export class NodeFactory {

    static getNodeInstance(node: Node, recordType: recordType): BaseComponent {
        switch (node.data.compId) {
            case 15:
                return new TriggerNode(recordType, node.data);
            case 16:
                return new TriggerNode(recordType, node.data);
            case 18:
                return new WaitForNode(recordType, node.data);
            case 19:
                return new CreateTaskNode(recordType, node.data);
            case 20:
                return new SendEmailNode(recordType, node.data);
            case 21:
                return new AssignOwnerNode(recordType, node.data);
            case 22:
                return new UpdateRecordNode(recordType, node.data);
            case 24:
                return new SendSurveyNode(recordType, node.data);
        }
    }
}