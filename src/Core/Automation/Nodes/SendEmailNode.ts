import { Company } from "../../../Entity/CompanyEntity";
import { Person } from "../../../Entity/PersonEntity";
import { Task } from "../../../Entity/TaskEntity";
import { RObject } from "../../../Types/FlowTypes";
import { BaseComponent } from "../BaseComponent";
import { EmailInteract } from "../Interactors/EmailInteract";
import { PathMapping } from "../PathMapping";

export class SendEmailNode extends BaseComponent {

    execute(records: RObject[]): PathMapping {
        const subject = this.componentConfig.subject;
        const body = this.componentConfig.body;
        for (const record of records) {
            let email = '';
            if (this.recordType === 'task' && record instanceof Task) {
                email = record.owner.email;
            } else if (this.recordType === 'person' && record instanceof Person) {
                email = record.email;
            } else if (this.recordType === 'company' && record instanceof Company) {
                email = record.pointOfContact.email;
            }

            if (email == null || email.length < 1) { continue; }
            EmailInteract.getInstance().addEmail({
                body: this.createEmailBody(body),
                subject: subject,
                email: email,
                recordId : record.id
            });
        }
        const pathMapping = new PathMapping('next', this.recordType)
        pathMapping.records = records;
        return pathMapping;
    }

    createEmailBody(body :string) :string{
        //TODO write body
        return body;
    }

}