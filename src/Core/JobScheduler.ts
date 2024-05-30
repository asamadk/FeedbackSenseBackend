import cron from 'node-cron';
import { logger } from '../Config/LoggerConfig';
import { HealthChecker } from '../Helpers/HealthCheker';
import { PaymentHandlerJob } from '../Integrations/PaymentIntegration/PaymentHandlerJob';
import { HealthScoreProcessor } from './BatchJobs/HealthScoreProcessor';
import { cronSchedule } from '../Helpers/CronConstants';
import { SurveyScoreProcessor } from './BatchJobs/SurveyScoreProcessor';
import { UsageFrequencyProcessor } from './BatchJobs/UsageFrequencyProcessor';

export class JobScheduler {

    public init() {
        logger.info('Job Scheduler initializing')
        this.scheduleHealthChecker();
        this.runUsageFrequencyProcessor();
        this.runHealthScoreProcessor();
        this.runSurveyScoreProcessor();
    }

    //process usage frequency 
    private runUsageFrequencyProcessor(){
        try{
            new UsageFrequencyProcessor().execute();
            cron.schedule(cronSchedule.DAILY_MIDNIGHT,() => new UsageFrequencyProcessor().execute());
        }catch(error){
            logger.error(`Error :: JobScheduler :: runSurveyScoreProcessor = ${error}`)
        }
    }

    //process nps & csat survey scores
    private runSurveyScoreProcessor(){
        try{
            new SurveyScoreProcessor().execute();
            cron.schedule(cronSchedule.DAILY_MIDNIGHT,() => new SurveyScoreProcessor().execute());
        }catch(error){
            logger.error(`Error :: JobScheduler :: runSurveyScoreProcessor = ${error}`)
        }
    }

    //Process health scores of companies
    private runHealthScoreProcessor(){
        try {
            new HealthScoreProcessor().execute();
            cron.schedule(cronSchedule.DAILY_MIDNIGHT,() => new HealthScoreProcessor().execute());
        } catch (error) {
            logger.error(`Error :: JobScheduler :: runHealthScoreProcessor = ${error}`)
        }
    }

    //Health checker job to send emails to support
    private scheduleHealthChecker() {
        try {
            cron.schedule(cronSchedule.DAILY_MIDNIGHT, () => {
                logger.info(`Starting health checker job...`)
                new HealthChecker().init();
            })
        } catch (error) {
            logger.error(`Error :: JobScheduler :: scheduleHealthChecker = ${error}`)
        }
    }

    //Payment handler is not used right now, will be used when payment will be automated
    private schedulePaymentHandlerJob() {
        try {
            // This runs the job every 3 days at 12:00 AM
            cron.schedule('0 0 */3 * *', () => {
                new PaymentHandlerJob();
            });
        } catch (error) {
            logger.error(`Error :: JobScheduler :: schedulePaymentHandlerJob = ${error}`)
        }
    }

}