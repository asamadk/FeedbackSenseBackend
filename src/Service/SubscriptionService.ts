import Stripe from "stripe";
import { getDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { getStripe } from "../Config/StripeConfig";
import { Organization } from "../Entity/OrgEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getSubScriptionDetailsHome = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Subscription fetched.');
        let subscriptionObj: Subscription;

        const subscriptionRepo = getDataSource(false).getRepository(Subscription);
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
        let subLimitObj
        if (subLimit != null) {
            subLimitObj = JSON.parse(subLimit);
            activeSurveyLimit = subLimitObj.activeSurveyLimit;
            usedSurveyLimit = subLimitObj.usedSurveyLimit;
        }

        const responseData: any = {
            name: subscriptionObj.plan.name,
            totalSurveyLimit: activeSurveyLimit,
            surveyLimitUsed: usedSurveyLimit,
            billingCycle: subscriptionObj.billing_cycle,
            responseStoreLimit: subLimitObj?.responseStoreLimit,
            responseCapacity: subLimitObj?.responseCapacity
        }

        const subscriptionData = await getUserStripeSubscriptionDetails(userEmail);
        const subscriptionDetails = subscriptionData?.data;

        if (subscriptionDetails != null && subscriptionDetails?.length > 0) {
            const subscriptionObj: Stripe.Subscription = subscriptionDetails[0];
            responseData.billingCycle = subscriptionObj?.items?.data[0]?.price?.recurring?.interval + 'ly'
            responseData.endDate = new Date(subscriptionObj.current_period_end * 1000).toLocaleDateString();
            if (subscriptionObj.cancel_at != null) {
                responseData.status = `Cancels - ${new Date(subscriptionObj.cancel_at * 1000)}`
            } else {
                responseData.status = 'Active';
            }
        } else {
            responseData.status = 'No subscription found.';
        }

        response.data = responseData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const getUserStripeSubscriptionDetails = async (email: string) => {
    const orgRepo = getDataSource(false).getRepository(Organization);
    const userRepo = getDataSource(false).getRepository(User);

    const user = await userRepo.findOneBy({
        email: email
    });

    const organization = await orgRepo.findOneBy({ id: user.organization_id })

    const stripe = getStripe();
    if (organization.payment_customerId == null) {
        return null;
    }
    return await stripe.subscriptions.list({
        customer: organization.payment_customerId,
    })
}