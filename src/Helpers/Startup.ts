import { Repository } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource"
import fs from 'fs';
import csv from 'csv-parser'
import { Plan } from "../Entity/PlanEntity";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { BASIC_PLAN, FREE_PLAN, PLUS_PLAN, PRO_PLAN, recordQueue } from "./Constants";
import { logger } from "../Config/LoggerConfig";
import { TemplateStartupScript } from "./StartupScripts/TemplateStartupScript";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
import { Organization } from "../Entity/OrgEntity";
import { FSCustomSetting } from "../Utils/SettingsUtils/CustomSettingsData";
import { createCustomSettings } from "../Service/CustomSettingsService";
import { connectRabbitMQ, getRabbitMQChannel } from "../Config/RabbitMQ";
import { Repository as R } from '../Helpers/Repository';
import path from "path";
import { Coupon } from "../Entity/CouponEntity";

export class StartUp {

    surveyTypeRepo: Repository<SurveyType>
    planRepo: Repository<Plan>
    toCreatePlanList: Plan[]
    planNamePrice: Map<string, number>
    planLimits: Map<string, string>
    planNameDescription: Map<string, string>

    async startExecution() {
        try {
            logger.info('StartUp script executing...');
            this.init();
            this.populatePlanAmount();
            this.populatePlanLimit();
            this.populatePlanDescription();
            await this.createSurveyType();
            await this.createPlans();
            await this.createCustomerSettingsExistingUser();
            await new TemplateStartupScript().initialize();
            await this.initializeRabbitMQ();
            await this.populateCoupons();
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    init() {
        try {
            this.surveyTypeRepo = AppDataSource.getDataSource().getRepository(SurveyType);
            this.planRepo = AppDataSource.getDataSource().getRepository(Plan);
            this.toCreatePlanList = [];
            this.planLimits = new Map<string, string>();
            this.planNamePrice = new Map<string, number>();
            this.planNameDescription = new Map<string, string>();
            logger.info('Startup class Initialized.');
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    populatePlanLimit() {
        // this.planLimits.set(FREE_PLAN, JSON.stringify(
        //     {}
        // ));
        this.planLimits.set(BASIC_PLAN, JSON.stringify(
            {}
        ));
        this.planLimits.set(PLUS_PLAN, JSON.stringify(
            {}
        ));
        this.planLimits.set(PRO_PLAN, JSON.stringify(
            {}
        ));
    }

    populatePlanAmount() {
        // this.planNamePrice.set(FREE_PLAN, 0);
        this.planNamePrice.set(BASIC_PLAN, 39);
        this.planNamePrice.set(PLUS_PLAN, 69);
        this.planNamePrice.set(PRO_PLAN, 119);
        logger.info('Plan prices populated');
    }

    populatePlanDescription() {
        // this.planNameDescription.set(FREE_PLAN, JSON.stringify({
        //     description: `Get Started for Free: Unlock the Power of FeedbackSense Without Cost`,
        //     features: [
        //         '1 Active Surveys',
        //         '50 Response / month',
        //         '1 User',
        //         'Basic analysis',
        //         'FeedbackSense will always have a free plan'
        //     ]
        // }));
        this.planNameDescription.set(BASIC_PLAN, JSON.stringify({
            description: `Best option for small teams & for your customers.`,
            features: [
                `All from ${FREE_PLAN} plan, plus`,
                '2 Users (Power Users)',
                '500 customer accounts',
                'Unlimited Surveys',
                'Dashboards',
                'SLA: 48 Hours',
                'Free Implementation',
            ]
        }));

        this.planNameDescription.set(PLUS_PLAN, JSON.stringify({
            description: `Relevant for multiple users, extended & premium support.`,
            features: [
                `All from ${BASIC_PLAN} plan, plus`,
                '5 Users (Power Users)',
                '2000 customer accounts',
                'Health Scores',
                'Customer Journeys',
                'SLA: 24 Hours',
                'Free Implementation'
            ]
        }));

        this.planNameDescription.set(PRO_PLAN, JSON.stringify({
            description: `Best for large scale uses and extended redistribution rights.`,
            features: [
                `All from ${PLUS_PLAN} plan, plus`,
                '10 Users (Power Users)',
                '5000 customer accounts',
                'Product Usage Tracking',
                'Revenue Compass',
                'SLA: 24 Hours',
                'Free Implementation'
            ]
        }));

        logger.info('Plan description populated.');
    }

    async createPlans() {
        try {
            const planNames: string[] = [
                // FREE_PLAN,
                BASIC_PLAN,
                PLUS_PLAN,
                PRO_PLAN,
            ];

            const planList = await AppDataSource.getDataSource().createQueryBuilder(Plan, 'plan')
                .where('plan.name IN (:names)', { names: [...planNames] })
                .getMany();

            const planNameSet: Set<string> = new Set<string>();
            planList.forEach(plan => {
                planNameSet.add(plan.name);
            });

            planNames.forEach(planName => {
                if (planNameSet.has(planName) === false) {
                    this.createPlan(planName);
                }
            });

            await this.insertPlan();
            logger.info('Plans created.');
        } catch (error) {
            logger.error(`Startup :: CreatePlans :: message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    async insertPlan() {
        if (this.toCreatePlanList.length < 1) { return; }
        await this.planRepo.save(this.toCreatePlanList);
    }

    createPlan(name: string) {
        try {
            const planObj = new Plan();
            planObj.name = name;
            planObj.price_cents = this.planNamePrice.get(name);
            if (planObj.price_cents !== 0) {
                planObj.price_cents_monthly = this.planNamePrice.get(name) + 6;
            } else {
                planObj.price_cents_monthly = 0;
            }
            planObj.description = this.planNameDescription.get(name);
            planObj.sub_limit = this.planLimits.get(name);
            planObj.currency = 'USD';
            this.toCreatePlanList.push(planObj);
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    async createSurveyType() {

        let surveyObj = await this.surveyTypeRepo.findOneBy({
            name: 'email/link'
        });

        if (surveyObj == null) {
            surveyObj = new SurveyType();
            surveyObj.label = 'Email or link Survey';
            surveyObj.name = 'email/link';
            this.surveyTypeRepo.save(surveyObj);
            logger.info('Survey type created.');
        }
    }


    async createCustomerSettingsExistingUser() {
        try {
            const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
            const customSettings = await customSetRepo.find();
            const orgRepo = AppDataSource.getDataSource().getRepository(Organization);
            const orgList = await orgRepo.find();

            if (customSettings.length < 1) {
                for (const org of orgList) {
                    await createCustomSettings(org.id);
                }
                return;
            }

            const orgIdVsSettingsKey = new Map<string, Set<string>>();
            customSettings.forEach(settings => {
                let keys = orgIdVsSettingsKey.get(settings.organizationId);
                if (keys == null) {
                    keys = new Set<string>();
                }
                keys.add(settings.fKey);
                orgIdVsSettingsKey.set(settings.organizationId, keys);
            });

            orgList.forEach(org => {
                if (!orgIdVsSettingsKey.has(org.id)) {
                    orgIdVsSettingsKey.set(org.id, new Set<string>());
                }
            })

            const availableKeys = Array.from(FSCustomSetting.keys());
            const customSettingsList: CustomSettings[] = [];

            for (const [orgId, values] of orgIdVsSettingsKey) {
                availableKeys.forEach(availableKey => {
                    if (!values.has(availableKey)) {
                        const setting = new CustomSettings();
                        setting.fKey = availableKey;
                        setting.fValue = FSCustomSetting.get(availableKey);
                        setting.organizationId = orgId;
                        customSettingsList.push(setting);
                    }
                });
            }
            customSetRepo.save(customSettingsList);

        } catch (error) {
            logger.error(`CreateCustomerSettingsExistingUser :: message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    async initializeRabbitMQ() {
        try {
            logger.info(`Initializing RabbitMQ...`);
            await connectRabbitMQ();
            logger.info(`RabbitMQ initialized`)
            const channel = getRabbitMQChannel();
            await channel.assertQueue(recordQueue, { durable: true });
        } catch (error) {
            logger.error(`initializeRabbitMQ :: message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    async populateCoupons() {
        const couponRepo = R.getCoupons();
        const existingCouponCount = await couponRepo.count();
        if (existingCouponCount > 0) { return; }
        logger.info('Populating REDEEM Coupons...');

        const coupons = [];
        fs.createReadStream(path.resolve(__dirname, '../../uuid.csv'))
            .pipe(csv({ headers: false }))
            .on('data', (row) => {
                const coupon = new Coupon();
                coupon.id = row[0];
                coupon.isUsed = false;
                coupons.push(coupon);
            })
            .on('end', async () => {
                try {
                    await couponRepo.save(coupons);
                    logger.info(`Successfully inserted ${coupons.length} coupons`);
                } catch (error) {
                    logger.error('Error inserting coupons:', error);
                }

            });
    }

}