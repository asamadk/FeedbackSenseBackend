import { WaitRecordsEntity } from "../../../Entity/WaitRecordsEntity";
import { Repository } from "../../../Helpers/Repository";
import { RObject } from "../../../Types/FlowTypes";

export class WaitRecordInteract {

    private waitRecords: WaitRecordsEntity[] = [];
    private componentIdWaitRecords: Map<string, RObject[]>;

    addWaitRecords(waitRecords: WaitRecordsEntity[]) {
        this.waitRecords = waitRecords;
    }

    async saveWaitRecords(flowId: string) {
        if (this.waitRecords?.length > 0) {
            this.waitRecords.forEach(wr => {
                wr.flowId = flowId;
            });
            
            await Repository.getWaitRecords().insert(this.waitRecords);
        }
        this.clearData();
    }

    clearData() {
        this.waitRecords = [];
        this.componentIdWaitRecords = new Map<string, RObject[]>();
    }

    getComponentWaitRecords(componentId: string): RObject[] {
        if (this.componentIdWaitRecords == null) {
            this.componentIdWaitRecords = new Map<string, RObject[]>();
        }
        const tmp = this.componentIdWaitRecords.get(componentId);
        return tmp || [];
    }

    storeComponentWaitRecords(componentIdWaitRecords: Map<string, RObject[]>) {
        this.componentIdWaitRecords = componentIdWaitRecords;
    }


}