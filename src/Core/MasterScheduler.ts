import cluster from "cluster";
import { logger } from "../Config/LoggerConfig";
import os from 'os';
import { initializeDataSource } from "../Config/AppDataSource";
import app from "../app";
import { JobScheduler } from "./JobScheduler";

export class MasterScheduler {

    numCPUs = os.cpus().length;

    async init() {
        logger.info(`Initializing FeedbackSense master scheduler...`);
        this.handleExceptions();
        await initializeDataSource();
        await this.startServer();
        new JobScheduler().init();
    }

    private async startServer() {
        if (cluster.isPrimary && process.env.NODE_ENV === 'prod') {
            logger.info(`Primary process (master) with PID ${process.pid} is running`);
            for (let i = 0; i < this.numCPUs; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker) => {
                logger.info(`Worker ${worker.process.pid} died`);
                cluster.fork();
            });
        } else {
            app.listen(process.env.PORT || 3001, async () => {
                logger.info(`Server started.`)
                logger.info(`Express is listening at ${process.env.SERVER_URL}`);
            });
        }
    }

    private handleExceptions() {
        process
            .on('unhandledRejection', (reason, p) => {
                logger.error(`Unhandled Rejection at Promise : Reason - ${reason}, Promise - ${p}`);
            })
            .on('uncaughtException', error => {
                logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
            });
    }

}