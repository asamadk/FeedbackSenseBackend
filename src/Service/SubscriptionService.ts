import { getDataSource } from "../Config/AppDataSource";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getSubScriptionDetailsHome = async(userId : string) : Promise<responseRest> => {
    const response = getDefaultResponse('Subscription fetched.');
    try {
        if(userId == null){
            return getCustomResponse([],404,'User Id is not provided',false);
        }
        let subscriptionObj : any;
        const subscriptionList = await getDataSource(false).query(
            `SELECT s.sub_limit,s.end_date,p.name, s.billing_cycle FROM Subscription s LEFT JOIN Plan p on s.planId = p.id
            WHERE s.userId  = '${userId}' LIMIT 1`
        );

        if(subscriptionList != null && subscriptionList.length > 0){
            subscriptionObj = subscriptionList[0];
        }
        
        if(subscriptionObj == null){
            return getCustomResponse([],404,'No subscription details found',false);
        }
        const subLimit = subscriptionObj.sub_limit;
        let activeSurveyLimit = 0;
        let usedSurveyLimit = 0;
        if(subLimit != null){
            const subLimitObj = JSON.parse(subLimit);
            activeSurveyLimit = subLimitObj.activeSurveyLimit;
            usedSurveyLimit = subLimitObj.usedSurveyLimit;
        }
        const responseData = {
            name : subscriptionObj.name,
            totalSurveyLimit : activeSurveyLimit, 
            surveyLimitUsed : usedSurveyLimit,
            billingCycle : subscriptionObj.billing_cycle,
            endDate : subscriptionObj.end_date
        }
        response.data = responseData;

    } catch (error) {
        console.log('Exception :: getSubScriptionDetailsHome :: err ',error);
    }
    return response;
}