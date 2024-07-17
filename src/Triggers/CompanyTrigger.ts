import { AutomationQueue } from "../Core/Automation/AutomationQueue";
import { Company } from "../Entity/CompanyEntity";
import { Repository } from "../Helpers/Repository";

export class CompanyTrigger {

    static async saveBulk(companies: Company[]) {
        const updatedList = [];
        const insertList = [];
        companies.forEach(company => {
            if (company.id != null && company.id.length > 0) {
                updatedList.push(company);
            } else {
                insertList.push(company);
            }
        });
        await Repository.getCompany().save(companies);
        const queue = new AutomationQueue<Company>('company');
        await Promise.all([
            queue.addRecord(insertList, 'insert'),
            queue.addRecord(updatedList, 'update')
        ]);

    }

    static async save(company: Company) {
        await this.saveBulk([company]);
    }

}