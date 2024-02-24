import { Plans } from "razorpay/dist/types/plans";
import { AppDataSource } from "../Config/AppDataSource";
import { Plan } from "../Entity/PlanEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { PaymentSuccessBody } from "../Types/ApiTypes";
import { CustomSettingsHelper } from "./CustomSettingHelper";
import { BASIC_PLAN, FREE_PLAN, MONTHLY_BILLING, PLUS_PLAN, PRO_PLAN } from "./Constants";
import { ACTIVE_SURVEY_LIMIT, ADD_CUSTOM_LOGO, AI_TEXT_ANALYSIS, EXPORT_FEATURE, FOLDER_FEATURE_ACTIVE, LOGO_DATA, REMOVE_FEEDBACK_SENSE_LOGO, SKIP_LOGIC_FEATURE, SURVEY_RESPONSE_CAPACITY, TEAM_ROLES, TEAM_SEATS, WORD_CLOUD } from "../Constants/CustomSettingsCont";
import Razorpay from "razorpay";
import { User } from "../Entity/UserEntity";
import { Survey } from "../Entity/SurveyEntity";
import { In } from "typeorm";
import { logger } from "../Config/LoggerConfig";

export class SubscriptionHelper {

    static razorPayInstance = new Razorpay({
        key_id: process.env.PAYMENT_KEY_ID,
        key_secret: process.env.PAYMENT_KEY_SECRET
    });

    static async unpublishAllSurveys(userSubscription: Subscription) {
        logger.info(`Deactivating all active surveys org :: ${userSubscription.organization.id}`);
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const users = await userRepo.findBy({ organization_id: userSubscription.organization.id });
        const userIds = users.map(user => user.id);

        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveys = await surveyRepo.find({
            where: {
                user_id: In(userIds)
            }
        });
        surveys.forEach(survey => {
            survey.is_published = false;
        });

        await surveyRepo.save(surveys);

        const subscriptionObj = await subRepo.findOneBy({ id: userSubscription.id });
        const subLimitStr = subscriptionObj.sub_limit;
        const subLimitObj = JSON.parse(subLimitStr);
        subLimitObj.usedSurveyLimit = 0;
        subscriptionObj.sub_limit = JSON.stringify(subLimitObj);
        await subRepo.save(subscriptionObj);
    }

    static async updateCustomSettingsByPlan(plan: Plan, subId: string, type: 'local' | 'razorpay') {
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const searchObj = {};
        if (type === 'local') {
            searchObj['id'] = subId
        } else {
            searchObj['razorpay_subscription_id'] = subId
        }
        const userSubscription = await subRepo.findOne({
            where: searchObj,
            relations: ['organization', 'plan']
        });

        if (userSubscription == null) {
            return;
        }
        const currentPlan = userSubscription.plan;
        if (plan.price_cents === 0) {
            this.unpublishAllSurveys(userSubscription);
        }

        if (plan?.id === currentPlan?.id) {
            return;
        }

        const customSettingHelper = CustomSettingsHelper.getInstance();
        await customSettingHelper.initialize(userSubscription.organization.id);
        if (plan.name === BASIC_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '300');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'false');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '100');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '1');
            customSettingHelper.setCustomSettings(LOGO_DATA, '');
            customSettingHelper.setCustomSettings(EXPORT_FEATURE, 'true');
            customSettingHelper.setCustomSettings(AI_TEXT_ANALYSIS, 'false');
            customSettingHelper.setCustomSettings(ADD_CUSTOM_LOGO, 'false');
            customSettingHelper.setCustomSettings(WORD_CLOUD, 'false');
            customSettingHelper.setCustomSettings(TEAM_ROLES, 'false');
        } else if (plan.name === PLUS_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '300');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'true');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'true');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '1000');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '3');
            customSettingHelper.setCustomSettings(LOGO_DATA, '');
            customSettingHelper.setCustomSettings(EXPORT_FEATURE, 'true');
            customSettingHelper.setCustomSettings(AI_TEXT_ANALYSIS, 'true');
            customSettingHelper.setCustomSettings(ADD_CUSTOM_LOGO, 'false');
            customSettingHelper.setCustomSettings(WORD_CLOUD, 'false');
            customSettingHelper.setCustomSettings(TEAM_ROLES, 'false');
        } else if (plan.name === PRO_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '300');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'true');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'true');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '10000');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '10');
            customSettingHelper.setCustomSettings(EXPORT_FEATURE, 'true');
            customSettingHelper.setCustomSettings(AI_TEXT_ANALYSIS, 'true');
            customSettingHelper.setCustomSettings(ADD_CUSTOM_LOGO, 'true');
            customSettingHelper.setCustomSettings(WORD_CLOUD, 'true');
            customSettingHelper.setCustomSettings(TEAM_ROLES, 'true');
        } else if (plan.name === FREE_PLAN) {
            logger.info(`Transferring org to Free Plan`);
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '5');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'false');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '50');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '1');
            customSettingHelper.setCustomSettings(LOGO_DATA, '');
            customSettingHelper.setCustomSettings(EXPORT_FEATURE, 'true');
            customSettingHelper.setCustomSettings(AI_TEXT_ANALYSIS, 'false');
            customSettingHelper.setCustomSettings(ADD_CUSTOM_LOGO, 'false');
            customSettingHelper.setCustomSettings(WORD_CLOUD, 'false');
            customSettingHelper.setCustomSettings(TEAM_ROLES, 'false');
        }
        await customSettingHelper.saveCustomSettings();
    }

    static async updateSubscription(
        subId: string,
        reqBody: PaymentSuccessBody,
        razorPayPlan: Plans.RazorPayPlans,
        selectedPlan: Plan
    ) {
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const userSubscription = await subRepo.findOneBy({ id: subId });
        if (userSubscription.razorpay_subscription_id != null) {
            try {
                await this.razorPayInstance.subscriptions.cancel(userSubscription.razorpay_subscription_id, false);
            } catch (error) {
                logger.error(`SubscriptionHelper :: updateSubscription :: Payment Error ${error?.error?.description}`);
            }
        }
        userSubscription.razorpay_subscription_id = reqBody.razorpay_subscription_id;
        userSubscription.billing_cycle = razorPayPlan.period;
        userSubscription.plan = selectedPlan;
        await subRepo.save(userSubscription);
    }

    static async updateSubscription2(
        subId: string,
        selectedPlan: Plan
    ) {
        try {
            const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
            const userSubscription = await subRepo.findOneBy({ razorpay_subscription_id: subId });
            if (userSubscription == null) { return; }

            const userSubscriptionWithPlan = await subRepo.findOne({
                where: { id: userSubscription.id },
                relations: ['organization', 'plan']
            });

            if (selectedPlan.id === userSubscriptionWithPlan?.plan?.id) { return; }
            userSubscription.plan = selectedPlan;
            await subRepo.save(userSubscription);
            logger.info(`Downgrading org :: ${userSubscriptionWithPlan.organization.id}`);
        } catch (error) {
            logger.error(`SubscriptionHelper :: updateSubscription2 :: ${error}`);
        }
    }

    static async getLocalPlanFromRazorPayPlan(razorPayPlan: Plans.RazorPayPlans) {
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        const planSearchObj = {};
        if (razorPayPlan.period === 'monthly') {
            const tempAmount: number = razorPayPlan.item.amount as number
            planSearchObj['price_cents_monthly'] = tempAmount / 100;
        } else {
            const tempAmount: number = razorPayPlan.item.amount as number
            planSearchObj['price_cents'] = (tempAmount / 12) / 100;
        }

        const selectedPlan = await planRepo.findOneBy(planSearchObj);
        return selectedPlan;
    }

    static isUserPayingForSamePlan = (
        planId: string,
        currentPlanId: string,
        currentBillingCycle: string,
        newBillingCycle: 'year' | 'month'
    ): boolean => {
        if (currentBillingCycle === MONTHLY_BILLING) {
            currentBillingCycle = 'month';
        } else {
            currentBillingCycle = 'year';
        }
        return planId === currentPlanId && currentBillingCycle === newBillingCycle;
    }

}