import Stripe from "stripe";
import { logger } from "../Config/LoggerConfig";
import { getStripe } from "../Config/StripeConfig";
import { AppDataSource } from "../Config/AppDataSource";
import { Invoice } from "../Entity/InvoiceEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { Plan } from "../Entity/PlanEntity";
import { Survey } from "../Entity/SurveyEntity";

export class SubscriptionHelper {

    private stripe = getStripe();
    private freePlan: Plan;
    private notificationList = [];

    init = async () => {
        try {
            logger.info('Initializing SubscriptionHelper....')
            this.freePlan = await this.populateFreePlan();
            logger.info('Free plan is fetched.');
            const subscriptions = await this.checkUsersSubscription();
            logger.info('Customers subscriptions fetched.');
            this.processSubscriptions(subscriptions);
            this.sendAllNotifications();
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    private checkUsersSubscription = async (): Promise<Stripe.Subscription[]> => {
        try {
            logger.info('Fetching subscription...');
            const subscriptionList = await this.stripe.subscriptions.list({ status: 'all' });
            const returnList: Stripe.Subscription[] = [];
            subscriptionList.data.forEach(subscription => {
                if (subscription.status != 'active') {
                    returnList.push(subscription);
                }
            });
            return returnList;
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    private processSubscriptions = (subscriptions: Stripe.Subscription[]) => {
        subscriptions.forEach(async subscription => {
            if (subscription.status === 'canceled') {
                logger.info('Cancelled plan found');
                await this.convertPlanToFreePlan(subscription);
            } else if (subscription.status === 'past_due') {
                const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
                const subscriptionEnded = subscription.current_period_end;
                const secondsPastDue = currentTimestamp - subscriptionEnded;
                const daysPastDue = Math.floor(secondsPastDue / (24 * 60 * 60)); // Convert seconds to days
                if (daysPastDue === 5) {
                    await this.convertPlanToFreePlan(subscription);
                } else if (daysPastDue < 5) {
                    await this.populateDueNotificationList(subscription);
                }
            }
        });
    }

    convertPlanToFreePlan = async (subscription: Stripe.Subscription) => {
        try {
            logger.info('Converting cancelled plan to free plan....');
            const invoiceRepo = AppDataSource.getDataSource().getRepository(Invoice);
            const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);

            const stripeInvoice = await invoiceRepo
                .createQueryBuilder("invoice")
                .leftJoinAndSelect("invoice.subscription", "subscription")
                .where("invoice.stripeSubscriptionId = :stripeSubscriptionId", { stripeSubscriptionId: subscription.id })
                .getOne();

            if (stripeInvoice == null) { return; }

            const localSubscription = await subscriptionRepo
                .createQueryBuilder('subscription')
                .leftJoinAndSelect('subscription.plan', 'plan')
                .leftJoinAndSelect('subscription.user', 'user')
                .where('subscription.id = :id', { id: stripeInvoice.subscription.id })
                .getOne();


            if (localSubscription.plan.id !== this.freePlan.id) {
                localSubscription.plan = this.freePlan;
                const subLimitObj = JSON.parse(localSubscription.sub_limit);
                subLimitObj.usedSurveyLimit = 0;
                localSubscription.sub_limit = JSON.stringify(subLimitObj);
                subscriptionRepo.save(localSubscription);
            }
            await this.unPublishAllSurveys(localSubscription.user.id);
            this.populateCancelNotificationList(subscription);
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    unPublishAllSurveys = async (userId: string) => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyList = await surveyRepo.findBy({ user_id: userId });
        surveyList.forEach(survey => {
            survey.is_published = false;
        });
        await surveyRepo.save(surveyList);
    }

    populateCancelNotificationList = async (subscription: Stripe.Subscription) => {
        //notify user about their plan being cancelled.
    }

    populateDueNotificationList = async (subscription: Stripe.Subscription) => {
        //notify user that their payment is due
    }

    sendAllNotifications = () => {
        //send all the collected notification    
    }

    populateFreePlan = async () => {
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        return await planRepo.findOneBy({
            price_cents: 0
        });
    }

}