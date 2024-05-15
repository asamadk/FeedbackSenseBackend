import moment from "moment";
import { convertLiteralToDate } from "../Utils/DateTimeUtils";
import { Repository } from "./Repository";
import { Between } from "typeorm";
import { formatMoney } from "../test/TestUtils.ts/AnalysisUtils";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";
import { User } from "../Entity/UserEntity";

type ChartData = {
    name: string,
    value: number
}

export class DashboardHelper {

    private startDate: Date;
    private endDate: Date;
    private type: 'all' | 'my';
    private userInfo: User;
    private startOfQuarter = moment().startOf('quarter').toDate();
    private endOfQuarter = moment().endOf('quarter').toDate();

    constructor(date: string, type: 'all' | 'my') {
        this.type = type;
        const obj = convertLiteralToDate(date);
        this.startDate = moment(obj.startDate).startOf('day').toDate();
        this.endDate = moment(obj.endDate).endOf('day').toDate();
        this.userInfo = AuthUserDetails.getInstance().getUserDetails();
        this.startOfQuarter = moment().startOf('quarter').toDate();
        this.endOfQuarter = moment().endOf('quarter').toDate();
    }

    async getTotalACV(): Promise<string> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: {
                    id: this.userInfo.organization_id
                }
            },
            select: ['totalContractAmount']
        });

        let totalContractValue = 0;
        companies.forEach(company => {
            totalContractValue += company.totalContractAmount
        });
        return formatMoney(totalContractValue);
    }

    async getOverAllCustomerHealth(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                // created_at: Between(this.startDate, this.endDate),
                organization: {
                    id: this.userInfo.organization_id
                }
            }
        });
        let goodCount = 0;
        let averageCount = 0;
        let poorCount = 0;

        companies.forEach(company => {
            if (company.healthScore !== null && company.healthScore !== undefined) {
                if (company.healthScore == 100) {
                    goodCount++;
                } else if (company.healthScore === 50) {
                    averageCount++;
                } else {
                    poorCount++;
                }
            }
        });
        return [
            { name: 'Good', value: goodCount },
            { name: 'Average', value: averageCount },
            { name: 'Poor', value: poorCount },
        ];
    }

    async getCustomJourneyData(): Promise<ChartData[]> {
        const journeyStages = await Repository.getJourneyStage().find({
            relations: ['companies'],
            where: { organization: { id: this.userInfo.organization_id } }
        });

        const journeyStageCounts = journeyStages.map(stage => ({
            name: stage.name,
            value: stage.companies.length,
        }));
        return journeyStageCounts;
    }

    async getTotalPayingCompanies() {
        const count = await Repository.getCompany().count({
            where: {
                organization: { id: this.userInfo.organization_id },
                contractStatus: 'Paying'
            }
        });
        return count;
    }

    async getQtrRenewalCompanies() {

        const companies = await Repository.getCompany().count({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
            },
        });

        return companies;
    }

    async getQtrRenewalContractVal() {
        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: {
                    id: this.userInfo.organization_id
                }
            },
            select: ['totalContractAmount']
        });

        let totalContractValue = 0;
        companies.forEach(company => {
            totalContractValue += company.totalContractAmount
        });
        return formatMoney(totalContractValue);
    }

    async getQtrRenewalHealthScore(): Promise<ChartData[]> {

        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: { id: this.userInfo.id }
            },
        });

        let goodCount = 0;
        let averageCount = 0;
        let poorCount = 0;

        companies.forEach(company => {
            if (company.healthScore !== null && company.healthScore !== undefined) {
                if (company.healthScore == 100) {
                    goodCount++;
                } else if (company.healthScore === 50) {
                    averageCount++;
                } else {
                    poorCount++;
                }
            }
        });

        return [
            { name: 'Good', value: goodCount },
            { name: 'Average', value: averageCount },
            { name: 'Poor', value: poorCount },
        ];
    }

    async getQtrOverdueRenewals() {
        const today = moment().toDate();

        return await Repository.getCompany().count({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, today),
            },
        });
    }

    async getQtrRiskRenewals() {
        return 0
    }

    async getQtrRiskContractValue() {
        return `$0`
    }

    async getQtrRenewedContractData(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
            },
            select: ['totalContractAmount']
        });

        const totalRenewedContractValue = companies.reduce((total, company) => {
            return total + (company.totalContractAmount || 0);
        }, 0);

        return [{ name: 'Renewed Contract Value', value: totalRenewedContractValue }];
        // return [{ name: 'Renewed', value: 80 }, { name: 'Unrenewed', value: 20 }]
    }

    async getQtrChurnedContractData(): Promise<ChartData[]> {
        return [{ name: 'Retained', value: 2000 }, { name: 'Churned', value: 13000 }]
    }

    async getContractValueAtRisk() {
        return '$0';
    }

    async getChurnRiskReasons(): Promise<ChartData[]> {
        return [{ name: 'Reason 1', value: 33 }, { name: 'Reason 2', value: 24 }, { name: 'Reason 3', value: 3 }, { name: 'Reason 4', value: 17 }];
    }

    async getNpsScoreChart(): Promise<ChartData[]> {
        return [{ name: 'Promoters', value: 8 }, { name: 'Detractors', value: 2 }];
    }

    async getCsatScoreChart(): Promise<ChartData[]> {
        return [{ name: 'Satisfied', value: 65 }, { name: 'Unsatisfied', value: 35 }]
    }

    async getDelayedOnboardingChart(): Promise<ChartData[]> {
        return [{ name: 'Delayed', value: 15 }, { name: 'On Time', value: 56 }]
    }

    getOnboardingHealth(): ChartData[] {
        return [{ name: 'Good', value: 30 }, { name: 'Poor', value: 80 }];
    }

}