import { getDataSource } from "../Config/AppDataSource";
import { Subscription } from "../Entity/SubscriptionEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getSubScriptionDetailsHome = async (userEmail: string): Promise<responseRest> => {
    const response = getDefaultResponse('Subscription fetched.');
    try {
        let subscriptionObj: any;

        const subscriptionRepo = getDataSource(false).getRepository(Subscription);
        const subscription = await subscriptionRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.user', 'user')
            .where('user.email = :userEmail', { userEmail })
            .getOne();

        if (subscription != null) {
            subscriptionObj = subscription;
        }

        if (subscriptionObj == null) {
            return getCustomResponse([], 404, 'No subscription details found', false);
        }
        const subLimit = subscriptionObj.sub_limit;
        let activeSurveyLimit = 0;
        let usedSurveyLimit = 0;
        if (subLimit != null) {
            const subLimitObj = JSON.parse(subLimit);
            activeSurveyLimit = subLimitObj.activeSurveyLimit;
            usedSurveyLimit = subLimitObj.usedSurveyLimit;
        }
        const responseData = {
            name: subscriptionObj.name,
            totalSurveyLimit: activeSurveyLimit,
            surveyLimitUsed: usedSurveyLimit,
            billingCycle: subscriptionObj.billing_cycle,
            endDate: subscriptionObj.end_date
        }
        response.data = responseData;

    } catch (error) {
        console.log('Exception :: getSubScriptionDetailsHome :: err ', error);
    }
    return response;
}