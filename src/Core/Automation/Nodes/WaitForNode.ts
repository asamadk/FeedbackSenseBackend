import { WaitRecordsEntity } from "../../../Entity/WaitRecordsEntity";
import { RObject } from "../../../Types/FlowTypes";
import { getWaitUntilDate } from "../../../Utils/DateTimeUtils";
import { BaseComponent } from "../BaseComponent";
import { WaitRecordInteract } from "../Interactors/WaitRecordInteract";
import { PathMapping } from "../PathMapping";

export class WaitForNode extends BaseComponent {

    execute(records: RObject[]): PathMapping {
        const toAddWaitRecords: WaitRecordsEntity[] = [];

        const day: number = this.componentConfig.days;

        for (const record of records) {
            const waitRec = new WaitRecordsEntity();
            waitRec.orgId = record.organization.id;
            waitRec.recordType = this.recordType;
            waitRec.recordId = record.id;
            waitRec.waitUntil = getWaitUntilDate(day);
            waitRec.componentId = this.componentUiId;
            toAddWaitRecords.push(waitRec);
        }

        WaitRecordInteract.getInstance().addWaitRecords(toAddWaitRecords);
        const alreadyWaitingRecords = WaitRecordInteract.getInstance().getComponentWaitRecords(this.componentUiId);
        const pathMapping = new PathMapping('next', this.recordType)
        pathMapping.records = alreadyWaitingRecords;
        return pathMapping;
    }

}