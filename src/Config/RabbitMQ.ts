import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { logger } from './LoggerConfig';

dotenv.config();

const RABBIT_MQ_URL: string = process.env.RABBIT_HOST || ''; 

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

async function connectRabbitMQ(): Promise<void> {
    try {
        connection = await amqp.connect(RABBIT_MQ_URL);
        channel = await connection.createChannel();
        // brew services start rabbitmq
    } catch (error) {
        logger.error(`connectRabbitMQ error - ${error.message}`);
    }
}

function getRabbitMQChannel(): amqp.Channel | null {
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