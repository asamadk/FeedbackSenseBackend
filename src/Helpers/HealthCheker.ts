import { promisify } from "util";
import * as fs from 'fs';
import * as readline from "readline";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateHealthCheckerMail } from "../Utils/MailUtils/MailMarkup/HealthChekerMarkup";
import PerformanceMetricsCollector, { Metric } from "../Core/PerformanceMetricsCollector";

export class HealthChecker {

    readFileAsync = promisify(fs.readFile);

    async init() {
        this.fetchTodaysErrors((todaysErrors : string[], error : any) => {
            if (error) {
                console.error('Failed to process log file:', error);
                return;
            }
            this.processTodaysErrors(todaysErrors);
        });
    } 

    private async getPerformanceMetrics() : Promise<Metric[]>{
        return await PerformanceMetricsCollector.collectMetrics();
    }

    private async processTodaysErrors(todaysErrors : string[]){
        await MailHelper.sendMail({
            html : generateHealthCheckerMail(
                todaysErrors,
                todaysErrors.length,
                await this.getPerformanceMetrics()
            ),
            subject : `System Health Alert - ${new Date().toLocaleDateString()}`,
            to : process.env.SUPPORT_EMAIL,
            from : process.env.MAIL_SENDER
        },'support');
    }

    private fetchTodaysErrors(callback : any) {
        function isToday(logDate : Date) {
            const today = new Date();
            return logDate.getDate() === today.getDate() &&
                logDate.getMonth() === today.getMonth() &&
                logDate.getFullYear() === today.getFullYear();
        }
        const logFileStream = fs.createReadStream(`logs/error.log`);
        const rl = readline.createInterface({
            input: logFileStream,
            crlfDelay: Infinity
        });

        const logRegex = /error: (\w{3}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}):(.+)/;
        const todaysErrors = [];

        rl.on('line', (line) => {
            const match = line.match(logRegex);
            if (match) {
                const logDateStr = match[1];
                const logDate = new Date(logDateStr.replace(/-/g, ' '));
                if (isToday(logDate)) {
                    todaysErrors.push(match[2].trim());
                }
            }
        }).on('close', () => {
            callback(todaysErrors);
        }).on('error', (error) => {
            callback(null, error);
        });
    }

}