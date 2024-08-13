import { logger } from "../Config/LoggerConfig";
import { getDefaultResponse } from "../Helpers/ServiceUtils";
import { SubscriptionHelper } from "../Helpers/SubscriptionHelper";
import { getRazorPayPlan, getRazorPaySubscription, verifyPayment } from "../Integrations/PaymentIntegration/RazorPayHelper";
import { PaymentSuccessBody, responseRest } from "../Types/ApiTypes";
import { ErrorType } from "../Utils/ErrorUtils/ErrorConstants";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateErrorEmailHtml } from "../Utils/MailUtils/MailMarkup/GerenicErrorMarkup";

export const handleSuccessfulPayment = async (reqBody: PaymentSuccessBody, subId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Payment successful.');
    try {
        const isPaymentVerified = verifyPayment(reqBody);
        response.success = isPaymentVerified;
        if (isPaymentVerified === false) {
            try {
                MailHelper.sendMail({
                    html: generateErrorEmailHtml(
                        `RetainSense is not able verify the Razorpay payment :: Local Subscription Id :: ${subId}`,
                        new Date().toISOString(),
                        'PaymentService :: handleSuccessfulPayment',
                        ErrorType.PAYMENT_UNVERIFIED
                    ),
                    subject: 'RetainSense Error Notification',
                    to: '',
                    from: process.env.MAIL_SENDER
                }, 'support');
            } catch (error) {
                logger.error(`PaymentService :: handleSuccessfulPayment :: Error sending failure email. ${error.message}`);
            }
            response.statusCode = 400;
            response.message = 'We are unable to verify the payment.'
            return response;
        }

        const razorPaySubscription = await getRazorPaySubscription(reqBody.razorpay_subscription_id);
        const razorPayPlan = await getRazorPayPlan(razorPaySubscription.plan_id);
        const selectedPlan = await SubscriptionHelper.getLocalPlanFromRazorPayPlan(razorPayPlan);
        await SubscriptionHelper.updateCustomSettingsByPlan(selectedPlan, subId, 'local');
        await SubscriptionHelper.updateSubscription(subId, reqBody, razorPayPlan, selectedPlan)
        return response;
    } catch (error) {
        logger.error(`Payment Error ${error?.error?.description}`);
        response.message = error?.error?.description;
        response.success = false;
        response.statusCode = 500;
        return response;
    }
}