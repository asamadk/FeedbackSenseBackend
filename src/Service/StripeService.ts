import Stripe from 'stripe';
import { AuthUserDetails } from '../Helpers/AuthHelper/AuthUserDetails';
import { AppDataSource } from '../Config/AppDataSource';
import { Organization } from '../Entity/OrgEntity';
import { User } from '../Entity/UserEntity';
import { Plan } from '../Entity/PlanEntity';
import { Subscription } from '../Entity/SubscriptionEntity';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { getStripe } from '../Config/StripeConfig';
import { Invoice } from '../Entity/InvoiceEntity';
import { Not } from 'typeorm';

export const getCustomerId = async (): Promise<string> => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const orgRepo = AppDataSource.getDataSource().getRepository(Organization);
    const userRepository = AppDataSource.getDataSource().getRepository(User);
    const currentUser = await userRepository.findOne({
        where: {
            email: userDetails.email
        }
    });
    const orgDetails = await orgRepo.findOne({ where: { id: currentUser.organization_id } });
    return orgDetails.payment_customerId;
}

export const createCustomer = async (currentUser: User) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const address = JSON.parse(currentUser?.address);
    const customer = await stripe.customers.create({
        name: userDetails.name,
        email: userDetails.email,
        address: {
            line1: address?.address,
            postal_code: address?.pinCode,
            city: address?.country,
            state: address?.country,
            country: 'US',
        },
    });
    return customer;
}

export const checkUserCurrentPlan = async (planId: string): Promise<boolean> => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const userEmail = userDetails.email;
    const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
    const currentSubscription = await subscriptionRepo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.user', 'user')
        .innerJoin('subscription.plan', 'plan')
        .select(['subscription', 'plan.id'])
        .where('user.email = :userEmail', { userEmail })
        .getOne();

    return currentSubscription?.plan?.id === planId
}

export const calculateOrderAmount = async (item: string) => {
    const planRepo = AppDataSource.getDataSource().getRepository(Plan);
    const selectedPlan = await planRepo.findOne({ where: { id: item } });
    if (selectedPlan == null) {
        throw new Error('Plan does not exist.');
    }
    return selectedPlan.price_cents * 100;
};

export const getCurrentPlanIdFromStrip = async (stripe: Stripe, amount: number): Promise<string> => {
    const plans = await stripe.plans.list();
    let finalPlanId: string;
    if (amount !== 0) {
        amount = amount * 100
    }
    plans.data.forEach(plan => {
        if (plan.amount == amount) {
            finalPlanId = plan.id;
            return;
        }
    });
    if (finalPlanId == null) {
        throw new Error('Strip Plan not found.');
    }
    return finalPlanId;
}

export const cancelCurrentSubscription = async (): Promise<responseRest> => {
    try {
        // console.log('cancelCurrentSubscription');
        const response = getCustomResponse({}, 200, 'Subscription updated.', true);
        const invoiceRepo = AppDataSource.getDataSource().getRepository(Invoice);

        const invoice = await invoiceRepo.findOne({
            where: {
                subscription: {
                    user: {
                        email: AuthUserDetails.getInstance().getUserDetails()?.email
                    },
                    plan: {
                        price_cents: Not(0)
                    }
                },
            },
            order: {
                createdAt: 'DESC'
            }
        });
        if (invoice == null) {
            return getCustomResponse(null, 400, 'You are already on free plan', false);
        }

        await getStripe().subscriptions.update(
            invoice.stripeSubscriptionId,
            {
                cancel_at_period_end: true,
            }
        );
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false);
    }
}