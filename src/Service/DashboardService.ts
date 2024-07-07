import { logger } from "../Config/LoggerConfig";
import { DashboardHelper } from "../Helpers/DashboardHelper";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getClientCompassDashboardData = async (date: string, type: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Dashboard Fetched');
        const helper = new DashboardHelper(date, type as any);

        const [
            totalACV, customerHealth, journeyStage, totalCompanies, qtrRenewalCompanies, qtrRenewalContractVal,
            qtrCustomerHealth, overdueRenewals, qtrRiskRenewal, qtrRiskContractVal, qtrRenewContract, qtrChurnContract,
            riskContractVal, churnRiskReasons, npsScore,avgNpsScore, csatScores,avgCsatScore, onboardingStages, onboardingHealth
        ] = await Promise.all([
            helper.getTotalACV(),
            helper.getOverAllCustomerHealth(),
            helper.getCustomJourneyData(),
            helper.getTotalPayingCompanies(),
            helper.getQtrRenewalCompanies(),
            helper.getQtrRenewalContractVal(),
            helper.getQtrRenewalHealthScore(),
            helper.getQtrOverdueRenewals(),
            helper.getQtrRiskRenewals(),
            helper.getQtrRiskContractValue(),
            helper.getQtrRenewedContractData(),
            helper.getQtrChurnedContractData(),
            helper.getContractValueAtRisk(),
            helper.getChurnRiskReasons(),
            helper.getNpsScoreChart(),
            helper.getAvgNpsScoreChart(),
            helper.getCsatScoreChart(),
            helper.getAvgCsatScoreChart(),
            helper.getOnboardingStagesChart(),
            helper.getOnboardingHealth()
        ]);

        response.data = {
            totalACV, customerHealth, journeyStage, totalCompanies, qtrRenewalCompanies, qtrRenewalContractVal, qtrCustomerHealth, 
            overdueRenewals,qtrRiskRenewal, qtrRiskContractVal, qtrRenewContract, qtrChurnContract, riskContractVal, churnRiskReasons,
            npsScore,avgNpsScore, csatScores,avgCsatScore,onboardingStages, onboardingHealth
        };
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}