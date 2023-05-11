import { User } from "../Entity/UserEntity";
import { getDataSource } from '../Config/AppDataSource';
import { responseRest } from "../Types/ApiTypes";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Plan } from "../Entity/PlanEntity";
import { MONTHLY_BILLING, STARTER_PLAN } from "../Helpers/Constants";
import { Subscription } from "../Entity/SubscriptionEntity";
import { logger } from "../Config/LoggerConfig";


export const handleSuccessfulLogin = async (user : any) : Promise<void> => {
    try{
        const userRepository = getDataSource(false).getRepository(User);
        const planRepo = getDataSource(false).getRepository(Plan);
        const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    
        let userEntity = new User();
    
        const userEmail : string = user?._json?.email;
        if(userEmail == null || userEmail === ''){
            return;
        }
    
        const savedUser = await userRepository.findOneBy({
            email : userEmail
        });

        const planObj = await planRepo.findOneBy({
            name : STARTER_PLAN
        });
    
        if(savedUser != null){return;}

        userEntity.name = user._json?.name;
        userEntity.email = user._json?.email;
        userEntity.emailVerified = user?._json?.email_verified;
        userEntity.oauth_provider = user?.provider;
             
        userEntity = await userRepository.save(userEntity);
        if(planObj != null){
            const subscObj = new Subscription();
            subscObj.user = userEntity;
            subscObj.plan = planObj;
            subscObj.start_date = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            subscObj.end_date = endDate;
            subscObj.sub_limit = getFreeSubscriptionLimit();
            subscObj.billing_cycle = MONTHLY_BILLING;
            await subscriptionRepo.save(subscObj);
        }
    }catch(error){
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    }
}

export const getFreeSubscriptionLimit = () : string => {
    const freeSubLimit = {
        usedSurveyLimit : 0,
        activeSurveyLimit : 1,
        responseStoreLimit : 5000
    }
    return JSON.stringify(freeSubLimit);
}

export const getUserAfterLogin = async (user : any) : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Login success');
        const userRepository = getDataSource(false).getRepository(User);
        
        if(user == null){
            return getCustomResponse(null,403,'Not Authorized',false);
        }
    
        const userObj = await userRepository.findOneBy({
            email : user?._json?.email
        });
    
        if(userObj == null){
            return getCustomResponse(null,404,'User not found',false);
        }
        
        response.data = userObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null,500,error.message,false)
    }
}