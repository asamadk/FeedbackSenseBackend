import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Subscription } from "../Entity/SubscriptionEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getSubScriptionDetailsHome = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Subscription fetched.');
        let subscriptionObj: Subscription;

        const subscriptionRepo = getDataSource(false).getRepository(Subscription);
        // const subscription = await subscriptionRepo
        //     .createQueryBuilder('subscription')
        //     .innerJoin('subscription.user', 'user')
        //     .where('user.email = :userEmail', { userEmail })
        //     .getOne();

        const subscription = await subscriptionRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.user', 'user')
            .innerJoin('subscription.plan', 'plan')
            .select(['subscription', 'plan.name'])
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
            name: subscriptionObj.plan.name,
            totalSurveyLimit: activeSurveyLimit,
            surveyLimitUsed: usedSurveyLimit,
            billingCycle: subscriptionObj.billing_cycle,
            endDate: subscriptionObj.end_date
        }
        response.data = responseData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}