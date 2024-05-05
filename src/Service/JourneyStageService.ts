import { logger } from "../Config/LoggerConfig";
import { JourneyLog } from "../Entity/JourneyLog";
import { JourneyStage } from "../Entity/JourneyStageEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

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

export const createSubJourney = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const journeyRepo = Repository.getJourneySubStage();
        await journeyRepo.save(reqBody);
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
        const journeyRepo = Repository.getJourneyStage();
        response.data = await journeyRepo.find({
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

export const getCustomerSubJourney = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const journeyRepo = Repository.getJourneySubStage();
        response.data = await journeyRepo.find({
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

export const updateCompanyJourney = async (data :any): Promise<responseRest> => {
    try {
        console.log('data = ',data);
        const response = getDefaultResponse('Company created successfully');
        const journeyLogRepo = Repository.getJourneyLog();
        const companyRepo = Repository.getCompany();

        const companyId :string = data.companyId;
        const journeyId :string = data.journey;
        
        if(companyId == null || companyId.length < 1 || journeyId == null || journeyId.length < 1){
            throw new Error('Payload incorrect.');
        }

        const company = await companyRepo.findOneBy({id : companyId});
        if(company == null){throw new Error('Company not found.')}

        company.stage = journeyId as any;
        await companyRepo.save(company);

        const toUpdateLogs = await journeyLogRepo.find({
            where : {
                company : {
                    id : companyId
                },
                exitTime : null
            }
        });
        toUpdateLogs.forEach(log => {
            log.exitTime = new Date();
        });
        
        await journeyLogRepo.save(toUpdateLogs);

        const journeyLog = new JourneyLog();
        journeyLog.company = company.id as any;
        journeyLog.journey = journeyId as any;
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
        const subJourneyRepo = Repository.getJourneySubStage();

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
        await journeyRepo.save(createdJourney);

        const createSubJourney: any[] = [
            {
                name: 'Kick Off',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 0
            },
            {
                name: 'Business Discovery',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 1
            },
            {
                name: 'Integration',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 2
            },
            {
                name: 'Configuration',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 3
            },
            {
                name: 'UAT & Training',
                isEnabled: true,
                isEnd: false,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 4
            },
            {
                name: 'Live',
                isEnabled: true,
                isEnd: true,
                organization: orgID as any,
                journeyType : 'onboarding',
                position: 5
            },
        ];
        await subJourneyRepo.save(createSubJourney);

    } catch (error) {
        logger.error(`createOnboardingStage :: message - ${error.message}, stack trace - ${error.stack}`);
    }
}