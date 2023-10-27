import Razorpay from "razorpay";
import { logger } from "../../Config/LoggerConfig";
import { Subscriptions } from "razorpay/dist/types/subscriptions";
import { SubscriptionHelper } from "../../Helpers/SubscriptionHelper";
import { AppDataSource } from "../../Config/AppDataSource";
import { Plan } from "../../Entity/PlanEntity";
import { FREE_PLAN } from "../../Helpers/Constants";

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
            const allSubscriptions = await this.getAllSubscriptions();
            const unpaidSubscriptions = this.filterDowngradeSubscriptions(allSubscriptions.items);
            const subsId = this.extractIdFromUnpaidSubscriptions(unpaidSubscriptions);
            await this.handleDowngrade(subsId);
        } catch (error) {
            logger.error(`Error in PaymentHandlerJob :: ${error}`);
        }
    }

    async handleDowngrade(subsId: string[]) {
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        const freePlan = await planRepo.findOneBy({ name: FREE_PLAN });
        const planChangePromise = subsId.map(subsId => {
            return SubscriptionHelper.updateCustomSettingsByPlan(freePlan, subsId);
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

    filterDowngradeSubscriptions(subs: Subscriptions.RazorpaySubscription[]): Subscriptions.RazorpaySubscription[] {
        const threeDaysAgoTimestamp = Date.now() / 1000 - (3 * 24 * 60 * 60);
        const unpaidSubscriptions = subs.filter(subscription =>
            (subscription.status === 'pending' || subscription.status === 'halted' || subscription.status === 'expired')
            && subscription.charge_at < threeDaysAgoTimestamp
        );
        return unpaidSubscriptions;
    }

    async getAllSubscriptions() {
        return await this.instance.subscriptions.all();
    }
}