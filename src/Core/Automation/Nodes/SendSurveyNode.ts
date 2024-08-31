import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { PathMapping } from "../PathMapping";

export class SendSurveyNode extends BaseComponent {

    execute(records: RObject[]): PathMapping {
        const surveyId = this.componentConfig.survey;
        const subject = this.componentConfig.subject;
        const body = this.componentConfig.body;

        for (const record of records) {
            let email = '';
            if (this.recordType === 'person' && record instanceof Person) {
                email = record.email;
            } else if (this.recordType === 'company' && record instanceof Company) {
                email = record.pointOfContact.email;
            }

            if (email == null || email.length < 1) { continue; }

            this.batchContext.emailInteract.addEmail({
                body: this.createEmailBody(body,surveyId,record),
                subject: subject,
                email: email,
                recordId: record.id
            });
        }

        const pathMapping = new PathMapping('next', this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }

    createEmailBody(body: string,surveyId :string,record :RObject): string {
        //TODO write body
        return body;
    }

}