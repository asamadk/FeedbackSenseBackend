import Razorpay from "razorpay";
import { logger } from "../../Config/LoggerConfig";
import { Subscriptions } from "razorpay/dist/types/subscriptions";
import { SubscriptionHelper } from "../../Helpers/SubscriptionHelper";
import { AppDataSource } from "../../Config/AppDataSource";
import { Plan } from "../../Entity/PlanEntity";
import { FREE_PLAN } from "../../Helpers/Constants";
import { Subscription } from "../../Entity/SubscriptionEntity";

export class PaymentHandlerJob {

    instance = new Razorpay({
        key_id: process.env.PAYMENT_KEY_ID,
        key_secret: process.env.PAYMENT_KEY_SECRET
    });

    constructor() {
        logger.info('Initializing payment handler job');
        this.init();
    }

    async init() {
        try {
            //find out what does halted status mean , I think we only need to process halter or cancelled
            const allSubscriptions = await this.getAllSubscriptions();
            const filteredSubs = this.filterDowngradeSubscriptions(allSubscriptions.items);
            const unpaidSubscriptions = filteredSubs.unpaidSubs;
            const subsId = this.extractIdFromUnpaidSubscriptions(unpaidSubscriptions);
            await this.handleDowngrade(subsId);
            const inUseSubsIds = await this.fetchSubscriptionIds();
            await this.cancelDuplicateSubscriptions(filteredSubs.duplicateSubs,inUseSubsIds);
        } catch (error) {
            logger.error(`Error in PaymentHandlerJob :: ${error}`);
        }
    }

    async cancelDuplicateSubscriptions(
        subs: Subscriptions.RazorpaySubscription[],
        inUseSubsIds : Set<string>
    ){
        const removeDups = subs.map(sub => {
            if(inUseSubsIds.has(sub.id) === false){
                return this.instance.subscriptions.cancel(sub.id,false);
            }
        });
        await Promise.all(removeDups);
    }

    async fetchSubscriptionIds() {
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const inUseSubsIds = new Set<string>();
        const localSubscriptions = await subscriptionRepo.find();
        localSubscriptions.forEach(subs => {
            inUseSubsIds.add(subs.razorpay_subscription_id);
        });
        return inUseSubsIds;
    }

    async handleDowngrade(subsId: string[]) {
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        const freePlan = await planRepo.findOneBy({ name: FREE_PLAN });

        const planChangePromise = subsId.map(subsId => {
            return SubscriptionHelper.updateCustomSettingsByPlan(freePlan, subsId, 'razorpay');
        });
        const downgradePlanPromise = subsId.map(subsId => {
            return SubscriptionHelper.updateSubscription2(subsId, freePlan);
        })

        await Promise.all(planChangePromise);
        await Promise.all(downgradePlanPromise);
    }

    extractIdFromUnpaidSubscriptions(subs: Subscriptions.RazorpaySubscription[]) {
        const rtnIds: string[] = [];
        subs.forEach(sub => {
            rtnIds.push(sub.id);
        })
        return rtnIds;
    }

    filterToDeleteSubscription(subs: Subscriptions.RazorpaySubscription[]): Subscriptions.RazorpaySubscription[] {
        return subs.filter(sub => sub.status === 'cancelled' || sub.status === 'expired');
    }

    filterDowngradeSubscriptions(subs: Subscriptions.RazorpaySubscription[]) {
        const threeDaysAgoTimestamp = Date.now() / 1000 - (3 * 24 * 60 * 60);
        const unpaidSubscriptions = subs.filter(subscription =>
            (
                subscription.status === 'pending' ||
                subscription.status === 'halted' ||
                subscription.status === 'expired' ||
                subscription.status === 'cancelled'
            )
            && subscription.charge_at < threeDaysAgoTimestamp
        );

        const duplicateActiveSubscription = subs.filter(sub =>
            sub.status === 'active'
        )

        return {
            unpaidSubs: unpaidSubscriptions,
            duplicateSubs: duplicateActiveSubscription
        }
    }

    async getAllSubscriptions() {
        return await this.instance.subscriptions.all();
    }
}