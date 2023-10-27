import { getDefaultResponse } from "../Helpers/ServiceUtils";
import { SubscriptionHelper } from "../Helpers/SubscriptionHelper";
import { getRazorPayPlan, getRazorPaySubscription, verifyPayment } from "../Integrations/PaymentIntegration/RazorPayHelper";
import { PaymentSuccessBody, responseRest } from "../Types/ApiTypes";

export const handleSuccessfulPayment = async (reqBody: PaymentSuccessBody, subId: string): Promise<responseRest> => {
    const response = getDefaultResponse('Payment successful.');
    const isPaymentVerified = verifyPayment(reqBody);
    response.success = isPaymentVerified;
    if (isPaymentVerified === false) {
        //TODO notify support about this
        response.statusCode = 400;
        response.message = 'We are unable to verify the payment.'
        return response;
    }

    const razorPaySubscription = await getRazorPaySubscription(reqBody.razorpay_subscription_id);
    const razorPayPlan = await getRazorPayPlan(razorPaySubscription.plan_id);
    const selectedPlan = await SubscriptionHelper.getLocalPlanFromRazorPayPlan(razorPayPlan);
    await SubscriptionHelper.updateCustomSettingsByPlan(selectedPlan,subId);
    await SubscriptionHelper.updateSubscription(subId,reqBody,razorPayPlan,selectedPlan)
    return response;
}