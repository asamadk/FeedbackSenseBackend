import { FindOptionsWhere, Not } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { JourneyLog } from "../Entity/JourneyLog";
import { JourneyStage } from "../Entity/JourneyStageEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { CompanyTrigger } from "../Triggers/CompanyTrigger";

export const createJourney = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const journeyRepo = Repository.getJourneyStage();
        await journeyRepo.save(reqBody);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const createOnboardingStage = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const onboardingRepo = Repository.getOnboardingStage();
        await onboardingRepo.save(reqBody);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const createRiskStage = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Risk stages created');
        const riskRepo = Repository.getRiskStage();
        await riskRepo.save(reqBody);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCustomerJourney = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        const whereClause = { organization: { id: userInfo.organization_id } }

        const [stage, onboarding, risk] = await Promise.all([
            Repository.getJourneyStage().find({
                where: whereClause,
                order: { position: 'ASC' }
            }),
            Repository.getOnboardingStage().find({
                where: whereClause,
                order: { position: 'ASC' }
            }),
            Repository.getRiskStage().find({
                where: whereClause,
                order: { position: 'ASC' }
            })
        ])
        response.data = {stage,onboarding,risk};
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCustomerOnboardingStage = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const onboardingRepo = Repository.getOnboardingStage();
        response.data = await onboardingRepo.find({
            where: {
                organization: {
                    id: userInfo.organization_id
                },
            },
            order: {
                position: 'ASC'
            }
        })
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateCompanyJourney = async (data: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const journeyLogRepo = Repository.getJourneyLog();
        const companyRepo = Repository.getCompany();

        const companyId: string = data.companyId;
        let journeyId: string = data.journey;
        const type :string = data.type;
                
        if (companyId == null || companyId.length < 1 || journeyId == null || journeyId.length < 1) {
            throw new Error('Payload incorrect.');
        }

        const company = await companyRepo.findOneBy({ id: companyId });
        if (company == null) { throw new Error('Company not found.') }

        if(journeyId === 'None'){
            journeyId = null;
        }

        const whereClause :FindOptionsWhere<JourneyLog> = {
            company: {
                id: companyId
            },
            exitTime: null
        }

        if(type === 'Journey Stage'){
            company.stage = journeyId as any;
            whereClause.journey = Not('');
        }else if(type === 'Onboarding'){
            company.onboardingStage = journeyId as any;
            whereClause.onboarding = Not('');
        }else{
            company.riskStage = journeyId as any
            whereClause.risk = Not('');
        }

        await CompanyTrigger.save(company);

        const toUpdateLogs = await journeyLogRepo.find({
            where: whereClause
        });
        toUpdateLogs.forEach(log => {
            log.exitTime = new Date();
        });

        await journeyLogRepo.save(toUpdateLogs);

        const journeyLog = new JourneyLog();
        journeyLog.company = company.id as any;
        if(type === 'Journey Stage'){
            journeyLog.journey = journeyId as any;
        }else if(type === 'Onboarding'){
            journeyLog.onboarding = journeyId as any;
        }else{
            journeyLog.risk = journeyId as any;
        }
        journeyLog.enterTime = new Date();

        await journeyLogRepo.save(journeyLog);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export async function createOnboardingStageForOrg(orgID: string) {
    try {
        const journeyRepo = Repository.getJourneyStage();
        const onboardingRepo = Repository.getOnboardingStage();
        const riskRepo = Repository.getRiskStage();

        const createdJourney: any[] = [
            {
                name: 'Onboarding',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 0,
            },
            {
                name: 'Adoption',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 1,
            },
            {
                name: 'Establishment',
                isEnabled: true,
                isEnd: true,
                organization: orgID as any,
                position: 2,
            },
            {
                name: 'Free Trial',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 3,
            }
        ];

        const onboardingStage: any[] = [
            {
                name: 'Kick Off',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 0
            },
            {
                name: 'Business Discovery',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 1
            },
            {
                name: 'Integration',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 2
            },
            {
                name: 'Configuration',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 3
            },
            {
                name: 'UAT & Training',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 4
            },
            {
                name: 'Live',
                isEnabled: true,
                isEnd: true,
                organization: orgID as any,
                position: 5
            },
        ];

        const riskStage: any[] = [
            {
                name: 'At Risk',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 0
            },
            {
                name: 'Plan in Place',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 1
            },
            {
                name: 'Saving',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                position: 2
            },
            {
                name: 'Closed - Recovered',
                isEnabled: true,
                isEnd: true,
                organization: orgID as any,
                position: 3
            },
            {
                name: 'Closed - Lost',
                isEnabled: true,
                isEnd: true,
                organization: orgID as any,
                position: 4
            }
        ];

        await Promise.all([
            journeyRepo.save(createdJourney),
            onboardingRepo.save(onboardingStage),
            riskRepo.save(riskStage)
        ])

    } catch (error) {
        logger.error(`createOnboardingStage :: message - ${error.message}, stack trace - ${error.stack}`);
    }
}