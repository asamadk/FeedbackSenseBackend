import { getMetadataArgsStorage } from "typeorm";
import { Task } from "../../../Entity/TaskEntity";
import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { PathMapping } from "../PathMapping";
import { parseDataType } from "../../../Utils/FlowUtils/FlowUtils";
import { getDateFromLiteral } from "../../../Utils/DateTimeUtils";
import { WorkflowInteract } from "../Interactors/WorkflowInteractor";

export class UpdateRecordNode extends BaseComponent {

    execute(records: RObject[]): PathMapping {
        for (const record of records) {
            const fields: any[] = this.componentConfig.fields;
            for (const field of fields) {
                record[field.field] = this.parseData(field.value);
            }
        }
        WorkflowInteract.getInstance(this.recordType).storeRecords(records);
        const pathMapping = new PathMapping('next', this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }

    parseData(value: string): string | number | Date | boolean {
        const parsedData = parseDataType(value);
        if (value === 'today' || value === 'yesterday' || value === 'tomorrow') {
            return getDateFromLiteral(value);
        }
        return parsedData;
    }

}