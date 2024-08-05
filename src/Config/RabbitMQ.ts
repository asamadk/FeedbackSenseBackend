import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { logger } from './LoggerConfig';

dotenv.config();

const RABBIT_MQ_URL: string = process.env.RABBIT_HOST || 'amqp://localhost';
const rabbitPassword :string = process.env.RABBIT_PASSWORD;
const rabbitUser :string = process.env.RABBIT_USER;

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

async function connectRabbitMQ(): Promise<void> {
    try {
        const mode : 'prod' | 'dev' = process.env.NODE_ENV as any;
        let url = '';
        if(mode === 'dev'){
            url = RABBIT_MQ_URL;
        }else{
            url = `amqps://${rabbitUser}:${rabbitPassword}@${RABBIT_MQ_URL}`
        }
        connection = await amqp.connect(url);
        channel = await connection.createChannel();
    } catch (error) {
        logger.error(`connectRabbitMQ error - ${error.message}`);
    }
}

async function getRabbitMQChannel(): Promise<amqp.Channel | null> {
    if(channel == null){
        await connectRabbitMQ();
    }
    return channel;
}

function closeConnection(): void {
    if (connection) {
        connection.close();
    }
}

export {
    connectRabbitMQ,
    getRabbitMQChannel,
    closeConnection,
};