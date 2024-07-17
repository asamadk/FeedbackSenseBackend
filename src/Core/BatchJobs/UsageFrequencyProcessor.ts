import { logger } from "../../Config/LoggerConfig";
import { Company } from "../../Entity/CompanyEntity";
import { Repository } from "../../Helpers/Repository";
import { CompanyTrigger } from "../../Triggers/CompanyTrigger";

export class UsageFrequencyProcessor {

    async execute() {
        try {
            logger.info('Usage Frequency Processor');
            const companies = await Repository.getCompany().find({
                select: { organization: { id: true } },
                relations: { organization: true }
            });

            const companyPromise = [];
            for(const company of companies){                
                companyPromise.push(
                    this.processUsage(company)
                );
            }
            const toUpdateCompanies = await Promise.all(companyPromise);            
            await CompanyTrigger.saveBulk(toUpdateCompanies);
            logger.info('Company usage frequency updated successfully');
        } catch (error) {
            logger.error(`Failed to update company usage frequency: ${error.message}`);
            throw new Error(`Failed to update company usage frequency: ${error.message}`);
        }
    }

    async processUsage(company : Company) :Promise<Company>{
        const sessionRepo = Repository.getUsageSession();
        const now = new Date();

        const sessions = await sessionRepo.find({
            where: { company: { id: company.id } },
        });

        const sessionCount = sessions.length;

        if (sessionCount > 0) {
            const firstSession = sessions.reduce((min, session) => session.startTime < min.startTime ? session : min, sessions[0]);
            const lastSession = sessions.reduce((max, session) => session.startTime > max.startTime ? session : max, sessions[0]);

            const firstSessionDate = new Date(firstSession.startTime);
            const lastSessionDate = new Date(lastSession.startTime);
            const totalDays = Math.ceil((now.getTime() - firstSessionDate.getTime()) / (1000 * 60 * 60 * 24));

            let frequency = "Inactive";

            if (totalDays > 0) {
                const dailySessions = sessionCount / totalDays;
                const weeklySessions = dailySessions * 7;
                const biweeklySessions = dailySessions * 14;
                const monthlySessions = dailySessions * 30;

                if (dailySessions >= 1) {
                    frequency = "Daily";
                } else if (weeklySessions >= 1) {
                    frequency = "Weekly";
                } else if (biweeklySessions >= 1) {
                    frequency = "BiWeekly";
                } else if (monthlySessions >= 1) {
                    frequency = "Monthly";
                }
            }

            company.usageFrequency = frequency;
        } else {
            company.usageFrequency = "Inactive";
        }
        return company;
    }

}