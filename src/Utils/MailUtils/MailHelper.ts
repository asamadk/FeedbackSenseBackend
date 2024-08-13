import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../../Config/LoggerConfig';

dotenv.config();

export type MailDataType = {
    from?: string
    to: string,
    subject: string,
    html: string
}

export class MailHelper {

    static transporter = nodemailer.createTransport({
        host: process.env.MAIL_SENDER_HOST,
        port: process.env.MAIL_SENDER_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_SENDER,
            pass: process.env.MAIL_SENDER_PASSWORD
        }
    });

    static async sendMail(data: MailDataType, receivers: 'customers' | 'support' | 'both') {
        try {
            const runningMode: string = process.env.NODE_ENV;
            if (runningMode.toLowerCase() === 'test' || runningMode.toLowerCase() === 'dev') {
                if (runningMode.toLowerCase() === 'dev') {
                    this.transporter = nodemailer.createTransport({
                        host: process.env.MAIL_SENDER_HOST,
                        port: process.env.MAIL_SENDER_PORT,
                        secure: true,
                        auth: {
                            user: process.env.MAIL_SENDER,
                            pass: process.env.MAIL_SENDER_PASSWORD
                        }
                    });
                } else {
                    return;
                }
            }

            try {
                await this.transporter.verify()
            } catch (error) {
                logger.error(`Error email verification - ${error}`)
            }

            data.from = process.env.MAIL_FROM
            if (receivers === 'support') {
                await this.sendMailToSupport(data);
            } else if (receivers === 'customers') {
                await this.sendMailToCustomers(data);
            } else {
                await this.sendMailToSupportAndCustomers(data);
            }
        } catch (error: any) {
            logger.info(`MailHelper error - ${error.message}`);
        }
    }

    static async sendMailToSupportAndCustomers(data: MailDataType) {
        await this.sendMailToCustomers(data);
        await this.sendMailToSupport(data);
    }

    static async sendMailToCustomers(data: MailDataType) {
        try {
            const info = await this.transporter.sendMail(data)
            logger.info(`Email sent : ${info.response}`);
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    static async sendMailToSupport(data: MailDataType) {
        logger.info('Sending mail...');
        data.to = process.env.SUPPORT_EMAIL
        try {
            const info = await this.transporter.sendMail(data)
            logger.info(`Email sent : ${info.response}`);
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

}