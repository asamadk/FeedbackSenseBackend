import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Subscription } from "../Entity/SubscriptionEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { ACTIVE_SURVEY_LIMIT, SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { generatePriceSelectionEmail } from "../Utils/MailUtils/MailMarkup/SubscriptionMarkup";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import Razorpay from "razorpay";
import { Plans } from "razorpay/dist/types/plans";
import { createUserSubscription, getRazorPaySubscription } from "../Integrations/PaymentIntegration/RazorPayHelper";
import { Organization } from "../Entity/OrgEntity";
import { SubscriptionHelper } from "../Helpers/SubscriptionHelper";

export const informSupportUserPricing = async (body: any) => {
    try {
        const response = getDefaultResponse('Thank you for your interest! We\'ll reach out to you within the next 24 hours');
        await MailHelper.sendMail({
            from: process.env.MAIL_SENDER,
            html: generatePriceSelectionEmail(AuthUserDetails.getInstance().getUserDetails(), body.price, body.planId),
            subject: 'RetainSense App : User selected a pricing plan',
            to: process.env.SUPPORT_EMAIL
        }, 'support');
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const initializePayment = async (body: any): Promise<responseRest> => {
    type bodyType = {
        price: number,
        planId: string,
        billing: 'year' | 'month'
    }
    const response = getDefaultResponse('Payment initialized.');

    const reqBody: bodyType = body;
    const razorPay = new Razorpay({
        key_id: process.env.PAYMENT_KEY_ID,
        key_secret: process.env.PAYMENT_KEY_SECRET
    });

    const subsRepo = AppDataSource.getDataSource().getRepository(Subscription);
    const userSubscription = await subsRepo.findOne({
        where: {
            organization: {
                id: AuthUserDetails.getInstance().getUserDetails().organization_id
            }
        },
        relations: ['plan']
    });
    if (userSubscription == null) {
        throw new Error('Fatal Error, Not Subscription found.Please contact support');
    }

    const isSamePlan = SubscriptionHelper.isUserPayingForSamePlan(
        reqBody.planId,
        userSubscription.plan.id,
        userSubscription.billing_cycle,
        reqBody.billing
    );

    if (isSamePlan === true) {
        throw new Error('Oops! It looks like you\'ve already subscribed to this plan');
    }

    const planList = await razorPay.plans.all();
    let selectedPlan: Plans.RazorPayPlans;
    planList.items.forEach(pl => {
        const planAmount = pl.item.amount;
        const selectedPlanAmount = (reqBody.billing === 'month' ? reqBody.price + 200 : reqBody.price * 12) * 100;
        if (planAmount === selectedPlanAmount) {
            selectedPlan = pl;
        }
    });
    if (selectedPlan == null) {
        throw new Error('Plan not found.Please contact support');
    }

    let razorPaySubscriptionId: string;
    if (userSubscription.razorpay_subscription_id == null || userSubscription.razorpay_subscription_id.length < 1) {
        razorPaySubscriptionId = await createUserSubscription(selectedPlan.id, reqBody.billing);
    } else {
        razorPaySubscriptionId = await createUserSubscription(selectedPlan.id, reqBody.billing);
    }

    if (razorPaySubscriptionId == null) {
        throw new Error('Error in creating subscription');
    }

    const orgRepo = AppDataSource.getDataSource().getRepository(Organization);
    const userOrg = await orgRepo.findOneBy({ id: AuthUserDetails.getInstance().getUserDetails().organization_id });
    response.data = {
        subId: razorPaySubscriptionId,
        name: userOrg.name,
        email: AuthUserDetails.getInstance().getUserDetails().email,
        callbackURL: `${process.env.SERVER_URL}payment/success?subId=${userSubscription.id}`,
        key: process.env.PAYMENT_KEY_ID
    }
    return response;
}

export const getSubScriptionDetailsHome = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Subscription fetched.');
        let subscriptionObj: Subscription;
        const userDetail = AuthUserDetails.getInstance().getUserDetails();
        const orgId = userDetail.organization_id;

        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const subscription = await subscriptionRepo
            .createQueryBuilder('subscription')
            .innerJoin('subscription.plan', 'plan')
            .select(['subscription', 'plan.name'])
            .where('subscription.organization.id = :orgId', { orgId })
            .getOne();

        if (subscription != null) {
            subscriptionObj = subscription;
        }

        if (subscriptionObj == null) {
            return getCustomResponse([], 404, 'No subscription details found', false);
        }

        if (orgId == null || orgId.length < 1) {
            logger.error(`message - Org Id not found :: getSubScriptionDetailsHome()`);
            throw new Error('Critical error , please contact support');
        }

        await CustomSettingsHelper.getInstance().initialize(orgId);
        const surveyResponseCapacity = CustomSettingsHelper.getInstance().getCustomSettings(SURVEY_RESPONSE_CAPACITY);
        const activeSurveyLimit = CustomSettingsHelper.getInstance().getCustomSettings(ACTIVE_SURVEY_LIMIT);

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

        try {
            const razorPaySubscription = await getRazorPaySubscription(subscriptionObj.razorpay_subscription_id);
            responseData.status = razorPaySubscription.status;
            responseData.nextInvoice = razorPaySubscription.current_end;
        } catch (error) {
            logger.error(`message - ${error}`);
            responseData.status = 'Active';
            responseData.nextInvoice = '';
        }
        response.data = responseData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getSubscriptionPaymentHistory = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Payment history fetched.');
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);

        const userSubs = await subscriptionRepo.findOneBy({
            organization: {
                id: AuthUserDetails.getInstance().getUserDetails().organization_id
            }
        });
        if (userSubs == null) {
            throw new Error('Subscription not found.');
        }
        const razorPaySubID = userSubs.razorpay_subscription_id;
        const razorPayInstance = new Razorpay({
            key_id: process.env.PAYMENT_KEY_ID,
            key_secret: process.env.PAYMENT_KEY_SECRET
        });
        const paymentHistory = await razorPayInstance.invoices.all({
            'subscription_id': razorPaySubID
        });

        const rows = [];
        paymentHistory.items.forEach(item => {
            rows.push({
                id: item.id,
                email: item.customer_details.email,
                orderId: item.order_id,
                amount: `${item.currency_symbol}${parseInt(item.amount as string) / 100}`,
                status: item.status,
                action : item.short_url
            })
        });
        response.data = {
            rows: rows
        };
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}