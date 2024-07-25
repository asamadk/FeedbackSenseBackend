import { logger } from "../Config/LoggerConfig";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getOnboardingStatus = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Onboarding status fetched');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        const [companyCount, personCount, flowCount] = await Promise.all([
            Repository.getCompany().count({
                where: {organization: {id: userInfo.organization_id}}
            }),
            Repository.getPeople().count({
                where: {organization: {id: userInfo.organization_id}}
            }),
            Repository.getFlow().count({
                where: {organization: {id: userInfo.organization_id}}
            })
        ]);

        let stepVal = 1;
        
        if(flowCount > 0){
            stepVal = 4;
        }else if(personCount > 0){
            stepVal = 3;
        }else if(companyCount > 0){
            stepVal = 2
        }

        response.data = stepVal;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}