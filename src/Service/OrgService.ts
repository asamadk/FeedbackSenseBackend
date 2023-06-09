import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Organization } from "../Entity/OrgEntity";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getUnAuthorizedResponse } from "../MiddleWares/AuthMiddleware";
import { responseRest } from "../Types/ApiTypes";
import { createCustomer } from "./StripeService";

export const createOrganizationForUser = async (user : any, orgName : string) : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Organization created successfully');
        
        const userRepository = getDataSource(false).getRepository(User);
        const orgRepo = getDataSource(false).getRepository(Organization);
    
        if(orgName == null || orgName.length == 0){
            return getCustomResponse([],404,'Organization name is not provided',false);
        }
    
        if(user == null || user._json == null){return getUnAuthorizedResponse();}
        
        const userEmail = user._json.email;
        if(userEmail == null){return getUnAuthorizedResponse();}
        
        const validUser = await userRepository.findOneBy({
            email : userEmail
        });
    
        if(validUser == null){
            return getCustomResponse([],404,' The user does not exists ',false);
        }
        
        const stripeCustomer = await createCustomer();
        const orgObj = new Organization();
        orgObj.name = orgName;
        orgObj.payment_customerId = stripeCustomer.id;
        await orgRepo.save(orgObj);
    
        validUser.organization_id = orgObj.id;
        userRepository.save(validUser);
    
        response.data = orgObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null,500,error.message,false)
    }
}

export const getAllOrgList = async() : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Organization fetched successfully');
        const orgRepo = getDataSource(false).getRepository(Organization);
        let orgList = await orgRepo.find();
        if(orgList == null){
            orgList = [];
        }
    
        response.data = orgList;
        return response;    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null,500,error.message,false)
    }
}


export const pointOrgToUser = async(user : any, orgData : any) : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Organization saved successfully');
        const userRepository = getDataSource(false).getRepository(User);
        if(user == null || user._json == null){return getUnAuthorizedResponse();}
        const userEmail = user._json.email;
        if(userEmail == null){return getUnAuthorizedResponse();}
        const validUser = await userRepository.findOneBy({
            email : userEmail
        });
        if(validUser == null){
            return getCustomResponse([],404,' The user does not exists ',false);
        }
        validUser.organization_id = orgData?.id;
        userRepository.save(validUser);
        response.data = validUser;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null,500,error.message,false)
    }

}