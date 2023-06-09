import { logger } from "../Config/LoggerConfig";
import { getStripe } from "../Config/StripeConfig";
import { Invoice } from "../Entity/InvoiceEntity";
import { getDataSource } from "../Config/AppDataSource";
import { Subscription } from "../Entity/SubscriptionEntity";
import { Plan } from "../Entity/PlanEntity";
import { WEBHOOK_SUBSCRIPTION_CREATE, WEBHOOK_SUBSCRIPTION_UPDATE } from "../Helpers/Constants";
import { Organization } from "../Entity/OrgEntity";
import { User } from "../Entity/UserEntity";

export const handleStripeWebHooks = async (event: any): Promise<boolean> => {
    try {
        logger.info('Webhook called...');
        logger.info(`Event type :: ${event.type}`);
        if (event.type === 'checkout.session.completed') {
            handleSuccessFulPayment(event, WEBHOOK_SUBSCRIPTION_CREATE);
        } else if (event.type === 'customer.subscription.updated') {
            const cancelledAt: string | null = event?.data?.object?.cancel_at
            const isSubscriptionCancelled = cancelledAt != null ? true : false;
            if (isSubscriptionCancelled === false) {
                handleSuccessFulPayment(event, WEBHOOK_SUBSCRIPTION_UPDATE);
            }
        }
        return true;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return false;
    }
}

const handleSuccessFulPayment = async (event: any, type: string) => {
    const session = event?.data?.object;
    await createInvoiceForUser(session, type);
    //TODO if something goes wrong we have to send mails for that.
}

async function getSubscriptionDetails(subscriptionId: string) {
    try {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const billingInterval = subscription.items.data[0].price.recurring.interval;
        return billingInterval.toString();
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    }
}

const getCustomerEmail = async (customerId: string): Promise<string> => {
    const stripe = getStripe();
    const customer: any = await stripe.customers.retrieve(customerId);
    return customer?.email;
}

const createInvoiceForUser = async (sessionData: any, type: string) => {
    let subscriptionId: string;
    let invoiceId: string;
    let finalAmount: number;
    let currentUserEmail: string;
    if (type === WEBHOOK_SUBSCRIPTION_CREATE) {
        subscriptionId = sessionData.subscription;
        invoiceId = sessionData.invoice;
        finalAmount = sessionData.amount_total;
        currentUserEmail = sessionData.customer_details.email;
    } else {
        subscriptionId = sessionData.id;
        invoiceId = sessionData.latest_invoice;
        finalAmount = sessionData?.plan?.amount;
        currentUserEmail = await getCustomerEmail(sessionData.customer);
    }

    const currency = sessionData.currency;
    const billingInterval = await getSubscriptionDetails(subscriptionId);

    const created = sessionData.created;
    const invoiceRepo = getDataSource(false).getRepository(Invoice);
    const localInvoice = new Invoice();
    localInvoice.amountCents = (finalAmount / 100);
    localInvoice.stripeInvoiceId = invoiceId;
    localInvoice.currency = currency;
    localInvoice.stripeSubscriptionId = subscriptionId;
    localInvoice.invoiceDate = new Date(created * 1000);

    if (billingInterval === 'month') {
        localInvoice.billingInterval = 'monthly';
    } else if (billingInterval === 'year') {
        localInvoice.billingInterval = 'yearly';
    } else {
        localInvoice.billingInterval = billingInterval;
    }

    const planRepo = getDataSource(false).getRepository(Plan);
    const plan = await planRepo.findOneByOrFail({
        price_cents: (finalAmount / 100)
    });

    const subscriptionRepo = getDataSource(false).getRepository(Subscription);
    const subscription = await subscriptionRepo.findOneByOrFail({
        user: { email: currentUserEmail },
    });

    const planLimits = plan.sub_limit;
    const planLimitObj = JSON.parse(planLimits);

    const subLimit = JSON.parse(subscription.sub_limit);
    planLimitObj.usedSurveyLimit = subLimit.usedSurveyLimit;

    if (plan?.id !== subscription?.plan?.id) {
        subscription.plan = plan;
        subscription.sub_limit = JSON.stringify(planLimitObj);
        await subscriptionRepo.save(subscription);
    }

    localInvoice.subscription = subscription;
    await invoiceRepo.save(localInvoice);

    const userRepo = getDataSource(false).getRepository(User);
    const orgRepo = getDataSource(false).getRepository(Organization);
    const currentUser = await userRepo.findOneBy({
        email: currentUserEmail
    });
    const userOrg = await orgRepo.findOneBy({
        id: currentUser.organization_id
    });

    await cancelIncompleteSubscriptions(userOrg.payment_customerId);
}

async function cancelIncompleteSubscriptions(customerId: string) {
    try {
        // Retrieve all subscriptions for the customer
        const subscriptions = await getStripe().subscriptions.list({
            customer: customerId,
            status: 'incomplete',
        });

        // Cancel each incomplete subscription
        const cancelPromises = subscriptions.data.map((subscription) =>
            getStripe().subscriptions.del(subscription.id)
        );

        await Promise.all(cancelPromises);

        logger.info('All incomplete subscriptions have been canceled.');
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    }
}