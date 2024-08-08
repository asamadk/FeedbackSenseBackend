import { recordType } from "../../Types/ApiTypes";
import { NodeData, RObject } from "../../Types/FlowTypes";
import { PathMapping } from "./PathMapping";

export class BaseComponent{
    
    protected recordType :recordType;
    protected data :NodeData;
    protected componentConfig :any;
    protected componentUiId :string;
    protected componentId :number;

    constructor(recordType :recordType, data :NodeData) {
        this.data = data;
        if(data.compConfig != null && data.compConfig.length > 0){
            this.componentConfig = JSON.parse(data.compConfig);
        }
        this.recordType = recordType;
        this.componentUiId = data?.uId;
        this.componentId = data?.compId;
    }

    execute(records :RObject[]): PathMapping{
        return new PathMapping('next',this.recordType);
    }

}