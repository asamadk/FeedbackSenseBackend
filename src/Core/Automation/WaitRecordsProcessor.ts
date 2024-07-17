import { LessThanOrEqual } from "typeorm";
import { Repository } from "../../Helpers/Repository";
import { AutomationQueue } from "./AutomationQueue";
import { recordQueue } from "../../Helpers/Constants";
import { getRabbitMQChannel } from "../../Config/RabbitMQ";
import { rabbitPayload } from "../../Types/FlowTypes";

export class WaitRecordProcessor {

    async execute() {
        const channel = getRabbitMQChannel();
        const toDeleteRecords = [];
        const waitRecords = await this.getCurrentWaitRecords();
        for (const waitRecord of waitRecords) {
            const payload: rabbitPayload = {
                flowId: waitRecord.flowId,
                id: waitRecord.recordId,
                orgId: waitRecord.orgId,
                recordType: waitRecord.recordType,
                type: 'update',
                isWaitRecord: true,
                componentId : waitRecord.componentId
            }
            channel.sendToQueue(recordQueue, Buffer.from(JSON.stringify(payload)), {
                persistent: true,
            });
            toDeleteRecords.push(waitRecord.id);
        }

        if(toDeleteRecords.length > 0){
            await Repository.getWaitRecords().delete(toDeleteRecords);
        }
    }

    async getCurrentWaitRecords() {
        const now = new Date();
        const waitRecord = await Repository.getWaitRecords().find({
            where: {
                waitUntil: LessThanOrEqual(now)
            }
        });
        return waitRecord;
    }

}