import * as amqp from 'amqplib';
import { getRabbitMQChannel } from '../../Config/RabbitMQ';
import { recordQueue } from '../../Helpers/Constants';
import { logger } from '../../Config/LoggerConfig';
import { rabbitPayload } from '../../Types/FlowTypes';
import { WorkflowCoreProcessor } from '../Automation/WorkflowCoreProcessor';

export class WorkflowProcessor {

    private channel: amqp.Channel;

    constructor() {
        this.init();
    }

    async init() {
        this.channel = getRabbitMQChannel();
    }

    async execute() {
        const totalProcessLimit = 1000;
        const messagePromise: Promise<amqp.GetMessage | false>[] = [];

        for (let i = 0; i < totalProcessLimit; i++) {
            const msg = this.channel.get(recordQueue, { noAck: false });
            messagePromise.push(msg);
        }

        const recordsToProcess = await Promise.all(messagePromise);
        const validMessages = recordsToProcess.filter((msg): msg is amqp.GetMessage => msg !== false);

        const records: rabbitPayload[] = [];
        validMessages.forEach(msg => {
            try {
                this.channel.ack(msg);
                const content = msg.content.toString();
                const data: rabbitPayload = JSON.parse(content);
                records.push(data);
            } catch (error) {
                logger.error(`Error :: WorkflowProcessor - execute ${error.message}`);
            }
        });

        if (records.length < 1) { return; }
        const groupedRecords = this.groupRecordsByFlowAndOrg(records);
        const recordsPromise = [];
        for (const [key, recordGroup] of groupedRecords.entries()) {
            recordsPromise.push(this.processGroupedRecords(recordGroup,key));
        }
        await Promise.all(recordsPromise);
    }

    groupRecordsByFlowAndOrg(records: rabbitPayload[]): Map<string, rabbitPayload[]> {
        const recordMap = new Map<string, rabbitPayload[]>();
        records.forEach(record => {
            const key = `${record.flowId}<>${record.orgId}<>${record.recordType}`;
            if (!recordMap.has(key)) {
                recordMap.set(key, []);
            }
            recordMap.get(key)!.push(record);
        });
        return recordMap;
    }

    async processGroupedRecords(records: rabbitPayload[],key :string) {
        await new WorkflowCoreProcessor(records,key).execute();
    }
}