import Stripe from "stripe";
import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { getStripe } from "../Config/StripeConfig";
import { Organization } from "../Entity/OrgEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { ACTIVE_SURVEY_LIMIT, SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { generatePriceSelectionEmail } from "../Utils/MailUtils/MailMarkup/SubscriptionMarkup";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";

export const informSupportUserPricing = async (body : any) => {
    try {
        const response = getDefaultResponse('Thank you for your interest! We\'ll reach out to you within the next 24 hours');
        await MailHelper.sendMail({
            from : process.env.MAIL_SENDER,
            html : generatePriceSelectionEmail(AuthUserDetails.getInstance().getUserDetails(),body.price,body.planId),
            subject : 'FeedbackSense App : User selected a pricing plan',
            to : process.env.SUPPORT_EMAIL
        },'support');
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getSubScriptionDetailsHome = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Subscription fetched.');
        let subscriptionObj: Subscription;

        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const subscription = await subscriptionRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.user', 'user')
            .innerJoin('subscription.plan', 'plan')
            .select(['subscription', 'plan.name','user.organization_id'])
            .where('user.email = :userEmail', { userEmail })
            .getOne();

        if (subscription != null) {
            subscriptionObj = subscription;
        }
        
        if (subscriptionObj == null) {
            return getCustomResponse([], 404, 'No subscription details found', false);
        }
        
        const orgId = subscription.user.organization_id;
        if(orgId == null || orgId.length < 1){
            logger.error(`message - Org Id not found :: getSubScriptionDetailsHome()`);
            throw new Error('Critical error , please contact support');
        }
        
        await CustomSettingsHelper.getInstance(orgId).initialize();
        const surveyResponseCapacity = CustomSettingsHelper.getInstance(orgId).getCustomSettings(SURVEY_RESPONSE_CAPACITY);
        const activeSurveyLimit = CustomSettingsHelper.getInstance(orgId).getCustomSettings(ACTIVE_SURVEY_LIMIT);

        const subLimit = subscriptionObj.sub_limit;
        let usedSurveyLimit = 0;
        let subLimitObj
        if (subLimit != null) {
            subLimitObj = JSON.parse(subLimit);
            usedSurveyLimit = subLimitObj.usedSurveyLimit;
        }

        const responseData: any = {
            name: subscriptionObj.plan.name,
            totalSurveyLimit: parseInt(activeSurveyLimit),
            surveyLimitUsed: usedSurveyLimit,
            billingCycle: subscriptionObj.billing_cycle,
            responseStoreLimit: parseInt(surveyResponseCapacity),
            responseCapacity: parseInt(surveyResponseCapacity)
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
    const orgRepo = AppDataSource.getDataSource().getRepository(Organization);
    const userRepo = AppDataSource.getDataSource().getRepository(User);

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