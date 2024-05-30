import moment from "moment";
import { convertLiteralToDate } from "../Utils/DateTimeUtils";
import { Repository } from "./Repository";
import { Between, FindOptionsWhere, Not } from "typeorm";
import { formatMoney } from "../test/TestUtils.ts/AnalysisUtils";
import { AuthUserDetails } from "./AuthHelper/AuthUserDetails";
import { User } from "../Entity/UserEntity";
import { Company } from "../Entity/CompanyEntity";

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

    getPayingWhereClause(): FindOptionsWhere<Company> {
        return {
            contractStatus: 'Paying'
        }
    }

    getOwnerWhereClause(): FindOptionsWhere<Company> {
        if (this.type === 'my') {
            return {
                owner: {
                    id: this.userInfo.id
                }
            }
        }
        return {};
    }

    async getTotalACV(): Promise<string> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: {
                    id: this.userInfo.organization_id
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['totalContractAmount']
        });

        let totalContractValue = 0;
        companies.forEach(company => {
            totalContractValue = totalContractValue + parseFloat(company.totalContractAmount.toString())
        });
        return formatMoney(totalContractValue);
    }

    async getOverAllCustomerHealth(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: {
                    id: this.userInfo.organization_id
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
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
        const journeyStageRepository = Repository.getJourneyStage();
        const query = journeyStageRepository.createQueryBuilder('journeyStage')
            .leftJoinAndSelect('journeyStage.companies', 'company')
            .where('journeyStage.organizationId = :organizationId', { organizationId: this.userInfo.organization_id })
            .where('company.contractStatus = :contractStatus', { contractStatus: 'Paying' })
            .andWhere('company.organizationId =:organizationId',{organizationId : this.userInfo.organization_id})
            .orderBy('journeyStage.position', 'ASC');

        if (this.type === 'my') {
            query.andWhere('company.ownerId = :ownerId', { ownerId: this.userInfo.id });
        }

        const journeyStages = await query.getMany();

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
                ...this.getPayingWhereClause(),
                ...this.getOwnerWhereClause()
            }
        });
        return count;
    }

    async getQtrRenewalCompanies() {
        const companies = await Repository.getCompany().count({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: {
                    id: this.userInfo.organization_id
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
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
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['totalContractAmount']
        });

        let totalContractValue = 0;
        companies.forEach(company => {
            totalContractValue += parseFloat(company.totalContractAmount.toString())
        });
        return formatMoney(totalContractValue);
    }

    async getQtrRenewalHealthScore(): Promise<ChartData[]> {

        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
        });

        let goodCount = 0;
        let averageCount = 0;
        let poorCount = 0;

        companies.forEach(company => {
            if (company.healthScore !== null && company.healthScore !== undefined) {
                if (company.healthScore == 100) {
                    goodCount++;
                } else if (company.healthScore == 50) {
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
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
        });
    }

    async getQtrRiskRenewals() {
        return await Repository.getCompany().count({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: { id: this.userInfo.organization_id },
                riskStage: {
                    id: Not(''),
                    isEnd: false
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
        });
    }

    async getQtrRiskContractValue() {
        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: { id: this.userInfo.organization_id },
                riskStage: {
                    id: Not(''),
                    isEnd: false
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['totalContractAmount']
        });
        let value = 0;
        companies.forEach(company => {
            value += parseFloat(company.totalContractAmount.toString())
        });

        return formatMoney(value);
    }

    async getQtrRenewedContractData(): Promise<string> {
        const startOfQuarter = moment().startOf('quarter').toDate();
        const endOfQuarter = moment().endOf('quarter').toDate();

        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                // nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            }
        });

        const companyIds = [];
        companies.forEach(company => companyIds.push(company.id));

        if(companyIds.length < 1){return '$0'}

        // Fetch company histories
        const historyQuery = Repository.getCompanyHistory().createQueryBuilder('history')
            .where('history.fieldName = :fieldName', { fieldName: 'totalContractAmount' })
            .andWhere('history.actionType = :actionType', { actionType: 'Update' })
            .andWhere('history.actionDate BETWEEN :startOfQuarter AND :endOfQuarter', { startOfQuarter, endOfQuarter })
            .andWhere('history.organizationId = :organizationId', { organizationId: this.userInfo.organization_id })
            .andWhere('history.companyId In (:...companyIds)', { companyIds: [...companyIds] });

        const histories = await historyQuery.getMany();

        let totalRenewedContractValue = 0;
        histories.forEach((history) => {
            totalRenewedContractValue += parseFloat(history.extraInfo.toString());
        });
        return formatMoney(totalRenewedContractValue);
    }

    async getQtrChurnedContractData(): Promise<string> {
        const companies = await Repository.getCompany().find({
            where: {
                nextRenewalDate: Between(this.startOfQuarter, this.endOfQuarter),
                organization: {
                    id: this.userInfo.organization_id
                },
                contractStatus : 'Churned',
                ...this.getOwnerWhereClause()
            },
            select: ['totalContractAmount', 'contractStatus']
        });

        let churned = 0;
        companies.forEach(company => {
            churned += parseFloat(company.totalContractAmount.toString());
        });
        return formatMoney(churned);
    }

    async getContractValueAtRisk() {
        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                riskStage: {
                    id: Not(''),
                    isEnd: false
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['totalContractAmount']
        });
        let value = 0;
        companies.forEach(company => {
            value += parseFloat(company.totalContractAmount.toString())
        });

        return formatMoney(value);
    }

    async getChurnRiskReasons(): Promise<ChartData[]> {
        return [{ name: 'Reason 1', value: 33 }, { name: 'Reason 2', value: 24 }, { name: 'Reason 3', value: 3 }, { name: 'Reason 4', value: 17 }];
    }

    async getNpsScoreChart(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['npsScore']
        });

        let promoters = 0;
        let passives = 0;
        let retractors = 0;

        companies.forEach(company => {
            const score = company.npsScore;
            if (score >= 9) { promoters++ }
            else if (score == 7 || score == 8) { passives++ }
            else if (score <= 6) { retractors++ }
        })

        return [{ name: 'Promoters', value: promoters }, { name: 'Detractors', value: retractors }, { name: 'Passives', value: passives }];
    }

    async getAvgNpsScoreChart(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['avgNpsScore']
        });

        let promoters = 0;
        let passives = 0;
        let retractors = 0;

        companies.forEach(company => {
            const score = company.avgNpsScore;
            if (score >= 9) { promoters++ }
            else if (score == 7 || score == 8) { passives++ }
            else if (score <= 6) { retractors++ }
        })

        return [{ name: 'Promoters', value: promoters }, { name: 'Detractors', value: retractors }, { name: 'Passives', value: passives }];
    }

    async getCsatScoreChart(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['csatScore']
        });

        let satisfied = 0;
        let unsatisfied = 0;

        companies.forEach(company => {
            const score = company.csatScore;
            if (score == 4 || score == 5) { satisfied++ }
            else { unsatisfied++ }
        })

        return [{ name: 'Satisfied', value: satisfied }, { name: 'Unsatisfied', value: unsatisfied }];
    }

    async getAvgCsatScoreChart(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: { id: this.userInfo.organization_id },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
            },
            select: ['avgCsatScore']
        });

        let satisfied = 0;
        let unsatisfied = 0;

        companies.forEach(company => {
            const score = company.avgCsatScore;
            if (score == 4 || score == 5) { satisfied++ }
            else { unsatisfied++ }
        })

        return [{ name: 'Satisfied', value: satisfied }, { name: 'Unsatisfied', value: unsatisfied }];
    }

    async getOnboardingStagesChart(): Promise<ChartData[]> {
        const onboardingStageRepository = Repository.getOnboardingStage();

        const query = onboardingStageRepository.createQueryBuilder('onboardingStage')
            .leftJoinAndSelect('onboardingStage.companies', 'company')
            .where('onboardingStage.organizationId = :organizationId', { organizationId: this.userInfo.organization_id })
            .andWhere('company.contractStatus = :contractStatus', { contractStatus: 'Paying' })
            .orderBy('onboardingStage.position', 'ASC');

        if (this.type === 'my') {
            query.andWhere('company.ownerId = :ownerId', { ownerId: this.userInfo.id });
        }

        const onboardingStages = await query.getMany();

        const onboardingStageCounts = onboardingStages.map(stage => ({
            name: stage.name,
            value: stage.companies.length,
        }));

        return onboardingStageCounts;
    }

    async getOnboardingHealth(): Promise<ChartData[]> {
        const companies = await Repository.getCompany().find({
            where: {
                organization: {
                    id: this.userInfo.organization_id
                },
                onboardingStage: {
                    id: Not(''),
                    isEnd: false
                },
                ...this.getOwnerWhereClause(),
                ...this.getPayingWhereClause()
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

}