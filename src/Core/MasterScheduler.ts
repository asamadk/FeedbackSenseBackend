import cluster from "cluster";
import { logger } from "../Config/LoggerConfig";
import os from 'os';
import { HealthChecker } from "../Helpers/HealthCheker";
import { PaymentHandlerJob } from "../Integrations/PaymentIntegration/PaymentHandlerJob";
import cron from 'node-cron';
import { initializeDataSource } from "../Config/AppDataSource";
import app from "../app";

export class MasterScheduler {

    numCPUs = os.cpus().length;

    async init() {
        logger.info(`Initializing FeedbackSense master scheduler...`);
        this.handleExceptions();
        await this.startServer();
        this.scheduleHealthChecker();
        this.schedulePaymentHandlerJob();
    }

    private async startServer() {
        await initializeDataSource();
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

    private scheduleHealthChecker() {
        // new HealthChecker().init();
        try {
            // This runs the job every day at 3:00 AM
            cron.schedule('0 3 * * *', () => {
                logger.info(`Starting health checker job...`)
                new HealthChecker().init();
            })
        } catch (error) {
            logger.error(`Error :: MasterScheduler :: scheduleHealthChecker = ${error}`)
        }
    }

    private schedulePaymentHandlerJob() {
        try {
            // This runs the job every 3 days at 12:00 AM
            cron.schedule('0 0 */3 * *', () => {
                new PaymentHandlerJob();
            });
        } catch (error) {
            logger.error(`Error :: MasterScheduler :: schedulePaymentHandlerJob = ${error}`)
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