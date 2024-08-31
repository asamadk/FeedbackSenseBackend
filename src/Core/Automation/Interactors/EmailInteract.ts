import { In } from "typeorm";
import { Repository } from "../../../Helpers/Repository";
import { recordType } from "../../../Types/ApiTypes";
import { emailNodePayload } from "../../../Types/FlowTypes";
import { getGoogleClient } from "../../../Integrations/IntegrationClients";
import { gmail_v1, google } from 'googleapis';
import { logger } from "../../../Config/LoggerConfig";

export class EmailInteract {

    private emailList: emailNodePayload[] = [];
    private orgId: string;
    private recordType: recordType;

    constructor(recordType: recordType, orgId: string) {
        this.recordType = recordType;
        this.orgId = orgId;
    }

    addEmail(payload: emailNodePayload) {
        if (this.emailList == null) {
            this.emailList = [];
        }
        this.emailList.push(payload);
    }

    async sendEmails() {
        logger.info(`EmailInteract - Sending emails - Count (${this.emailList.length})`);
        const googleCredentials = await this.connectGoogle();
        const gmail = google.gmail({ version: 'v1', auth: googleCredentials });
        await Promise.all(this.emailList.map(data => {
            let email = {
                message: `To: <${data.email}>\r\nContent-type: 
                text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: ${data.subject}
                \r\n\r\n${data.body}`
            }
            const base64EncodedEmail = Buffer.from(email.message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            return gmail.users.messages.send({
                auth: googleCredentials,
                userId: 'me',
                requestBody: {
                    payload: {
                        headers: [
                            { name: "To", value: `<${data.email}>` },
                            { name: 'Subject', value: `${data.subject}` }]
                    },
                    raw: base64EncodedEmail
                }
            });
        }));
        logger.info(`EmailInteract - Emails Sent`);
        this.clearData();
    }

    async connectGoogle() {
        const credRepo = Repository.getCredentials();
        const users = await Repository.getUser().find({ where: { organization_id: this.orgId } });
        const userIds = users.map(u => u.id);
        const credentials = await credRepo.findOne({ where: { userId: In(userIds) } })
        if (credentials == null) {
            throw new Error(`No credentials found for org - ${this.orgId}`);
        }
        const tokens = credentials.key;
        const googleCredentials = getGoogleClient();
        googleCredentials.setCredentials({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        });
        return googleCredentials;
    }

    clearData() {
        this.emailList = [];
    }
}