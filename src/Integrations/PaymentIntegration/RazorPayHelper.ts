import Razorpay from "razorpay";
import { User } from "../../Entity/UserEntity"
import crypto from 'crypto';
import { PaymentSuccessBody } from "../../Types/ApiTypes";
import { logger } from "../../Config/LoggerConfig";
import { Subscriptions } from "razorpay/dist/types/subscriptions";
import { Plans } from "razorpay/dist/types/plans";

const instance = new Razorpay({
    key_id: process.env.PAYMENT_KEY_ID,
    key_secret: process.env.PAYMENT_KEY_SECRET
});

export const createPaymentCustomer = async (orgName: string, user: User): Promise<string> => {
    const createdCustomer = await instance.customers.create({
        name: orgName,
        email: user.email,
    })
    return createdCustomer.id;
}

export const createUserSubscription = async (razorPayPlanId: string,billing: 'year' | 'month'): Promise<string> => {
    try {
        const createdSub = await instance.subscriptions.create({
            plan_id: razorPayPlanId,
            customer_notify: 1,
            quantity: 1,
            total_count: billing === 'month' ? 100 : 10,
        });
        return createdSub.id;    
    } catch (error) {
        logger.error(error);
        return null;
    }
}

export const getRazorPayPlan = async (planId : string) : Promise<Plans.RazorPayPlans> => {
    return await instance.plans.fetch(planId);
}

export const getRazorPaySubscription = async(subscriptionId : string) :Promise<Subscriptions.RazorpaySubscription>  => {
    return await instance.subscriptions.fetch(subscriptionId);
}

export const verifyPayment = (data: PaymentSuccessBody): boolean => {
    const generated_signature = crypto
        .createHmac('sha256', process.env.PAYMENT_KEY_SECRET)
        .update(data.razorpay_payment_id + '|' + data.razorpay_subscription_id)
        .digest('hex');
    return generated_signature === data.razorpay_signature;
}