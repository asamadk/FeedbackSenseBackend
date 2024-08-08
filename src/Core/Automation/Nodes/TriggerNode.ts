import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { PathMapping } from "../PathMapping";

export class TriggerNode extends BaseComponent{

    execute(records: RObject[]): PathMapping {
        const pathMapping = new PathMapping('next',this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }
    
}