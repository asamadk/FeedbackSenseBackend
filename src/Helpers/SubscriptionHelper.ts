import { Plans } from "razorpay/dist/types/plans";
import { AppDataSource } from "../Config/AppDataSource";
import { Plan } from "../Entity/PlanEntity";
import { Subscription } from "../Entity/SubscriptionEntity";
import { PaymentSuccessBody } from "../Types/ApiTypes";
import { CustomSettingsHelper } from "./CustomSettingHelper";
import { FREE_PLAN, PLUS_PLAN, STARTER_PLAN, ULTIMATE_PLAN } from "./Constants";
import { ACTIVE_SURVEY_LIMIT, FOLDER_FEATURE_ACTIVE, REMOVE_FEEDBACK_SENSE_LOGO, SKIP_LOGIC_FEATURE, SURVEY_RESPONSE_CAPACITY, TEAM_SEATS } from "../Constants/CustomSettingsCont";
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

    static async unpublishAllSurveys(userSubscription : Subscription){
        logger.info(`Downgrading org :: ${userSubscription.organization.id}`);
        logger.info(`Deactivating all active surveys org :: ${userSubscription.organization.id}`);
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const users = await userRepo.findBy({organization_id : userSubscription.organization.id});
        const userIds = users.map(user => user.id);

        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveys = await surveyRepo.find({
            where : {
                user_id : In(userIds)
            }
        });
        surveys.forEach(survey => {
            survey.is_published = false;
        });

        await surveyRepo.save(surveys);

        const subscriptionObj = await subRepo.findOneBy({id : userSubscription.id});
        const subLimitStr = subscriptionObj.sub_limit;
        const subLimitObj = JSON.parse(subLimitStr);
        subLimitObj.usedSurveyLimit = 0;
        subscriptionObj.sub_limit = JSON.stringify(subLimitObj);
        await subRepo.save(subscriptionObj);
    }

    static async updateCustomSettingsByPlan(plan: Plan, subId: string) {
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const userSubscription = await subRepo.findOne({
            where: {
                id: subId
            },
            relations: ['organization','plan']
        });

        const currentPlan = userSubscription.plan;
        if(currentPlan.price_cents > plan.price_cents){
            this.unpublishAllSurveys(userSubscription);
        }

        const customSettingHelper = CustomSettingsHelper.getInstance();
        await customSettingHelper.initialize(userSubscription.organization.id);
        if (plan.name === STARTER_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '3');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'false');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '100');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '1');
        } else if (plan.name === PLUS_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '5');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'false');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '2000');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '3');
        } else if (plan.name === ULTIMATE_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '10');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'true');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'true');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '10000');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '10');
        } else if (plan.name === FREE_PLAN) {
            customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT, '1');
            customSettingHelper.setCustomSettings(FOLDER_FEATURE_ACTIVE, 'false');
            customSettingHelper.setCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO, 'false');
            customSettingHelper.setCustomSettings(SKIP_LOGIC_FEATURE, 'true');
            customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY, '50');
            customSettingHelper.setCustomSettings(TEAM_SEATS, '1');
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
            await this.razorPayInstance.subscriptions.cancel(userSubscription.razorpay_subscription_id, false);
        }
        userSubscription.razorpay_subscription_id = reqBody.razorpay_subscription_id;
        userSubscription.billing_cycle = razorPayPlan.period;
        userSubscription.plan = selectedPlan;
        await subRepo.save(userSubscription);
    }

    static async updateSubscription2(
        subId: string,
        selectedPlan: Plan
    ){
        const subRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const userSubscription = await subRepo.findOneBy({ id: subId });
        userSubscription.plan = selectedPlan;
        await subRepo.save(userSubscription);
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

}