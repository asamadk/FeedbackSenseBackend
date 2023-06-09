import Stripe from 'stripe';
import { AuthUserDetails } from '../Helpers/AuthHelper/AuthUserDetails';
import { getDataSource } from '../Config/AppDataSource';
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
    const orgRepo = getDataSource(false).getRepository(Organization);
    const userRepository = getDataSource(false).getRepository(User);
    const currentUser = await userRepository.findOne({
        where: {
            email: userDetails._json.email
        }
    });
    const orgDetails = await orgRepo.findOne({ where: { id: currentUser.organization_id } });
    return orgDetails.payment_customerId;
}

export const createCustomer = async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const customer = await stripe.customers.create({
        name: userDetails._json.name,
        email: userDetails._json.email,
        address: {
            line1: '510 Townsend St',
            postal_code: '210001',
            city: 'Banda',
            state: 'UP',
            country: 'US',
        },
    });
    return customer;
}

export const checkUserCurrentPlan = async (planId: string): Promise<boolean> => {
    const userDetails = AuthUserDetails.getInstance().getUserDetails();
    const userEmail = userDetails._json.email;
    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
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
    const planRepo = getDataSource(false).getRepository(Plan);
    const selectedPlan = await planRepo.findOne({ where: { id: item } });
    if (selectedPlan == null) {
        throw 'Plan does not exist.';
    }
    return selectedPlan.price_cents * 100;
};

export const getCurrentPlanIdFromStrip = async (stripe: Stripe, amount: number): Promise<string> => {
    const plans = await stripe.plans.list();
    let finalPlanId: string;
    if(amount !== 0){
        amount = amount * 100
    }
    plans.data.forEach(plan => {
        if (plan.amount == amount) {
            finalPlanId = plan.id;
            return;
        }
    });
    if (finalPlanId == null) {
        throw 'Strip Plan not found.';
    }
    return finalPlanId;
}

export const cancelCurrentSubscription = async (): Promise<responseRest> => {
    try {
        // console.log('cancelCurrentSubscription');
        const response = getCustomResponse({}, 200, 'Subscription updated.', true);
        const invoiceRepo = getDataSource(false).getRepository(Invoice);

        const invoice = await invoiceRepo.findOne({
            where: {
                subscription: {
                    user: {
                        email: AuthUserDetails.getInstance().getUserDetails()?._json?.email
                    },
                    plan : {
                        price_cents  : Not(0)
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