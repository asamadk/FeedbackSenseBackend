import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../../Config/LoggerConfig';

dotenv.config();

export type MailDataType = {
    from ?: string
    to: string,
    subject: string,
    html: string
}

export class MailHelper {

    static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_SENDER,
            pass: process.env.MAIL_SENDER_PASSWORD
        }
    });

    static async sendMail(data: MailDataType, receivers: 'customers' | 'support' | 'both') {
        data.from = process.env.MAIL_SENDER
        if (receivers === 'support') {
            await this.sendMailToSupport(data);
        } else if (receivers === 'customers') {
            await this.sendMailToCustomers(data);
        } else {
            await this.sendMailToSupportAndCustomers(data);
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
        data.to = process.env.SUPPORT_EMAIL
        try {
            const info = await this.transporter.sendMail(data)
            logger.info(`Email sent : ${info.response}`);
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

}