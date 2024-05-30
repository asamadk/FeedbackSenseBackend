import { logger } from "../Config/LoggerConfig";
import { HealthDesign } from "../Entity/HealthDesign";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const createHealthConfig = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Health config created.');
        const healthRepo = Repository.getHealthDesign();
        
        const id :string | null = reqBody.id;
        const config = reqBody.config;

        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        const health = new HealthDesign();
        health.config = config;
        health.name = 'Initial Health';
        health.organization = userInfo.organization_id as any;
        if(id != null && id.length > 0){
            health.id = id;
        }
        await healthRepo.save(health);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getHealthConfig = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('');
        const healthRepo = Repository.getHealthDesign();
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const res = await healthRepo.findOne({
            where : {
                organization : {
                    id : userInfo.organization_id
                }
            }
        })
        response.data = res;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}