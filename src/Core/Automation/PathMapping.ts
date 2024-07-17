import { recordType } from "../../Types/ApiTypes";
import { RObject } from "../../Types/FlowTypes";

export class PathMapping{
    path :string;
    recordType :recordType;
    records :RObject[];
    extraInfo : Map<string,any>;

    constructor(path :string,recordType :recordType) {
        this.path = path;
        this.recordType = recordType;
    }
}