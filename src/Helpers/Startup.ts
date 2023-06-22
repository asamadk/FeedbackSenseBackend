import { Repository } from "typeorm";
import { getDataSource } from "../Config/AppDataSource"
import { Plan } from "../Entity/PlanEntity";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { ENTERPRISE_PLAN, FREE_PLAN, GROWTH_PLAN, STARTER_PLAN, ULTIMATE_PLAN } from "./Constants";
import { logger } from "../Config/LoggerConfig";

export class StartUp {

    surveyTypeRepo: Repository<SurveyType>
    planRepo: Repository<Plan>
    toCreatePlanList: Plan[]
    planNamePrice: Map<string, number>
    planLimits: Map<string, string>
    planNameDescription: Map<string, string>

    startExecution() {
        try {
            logger.info('StartUp script executing...');
            this.init();
            this.populatePlanAmount();
            this.populatePlanLimit();
            this.populatePlanDescription();
            this.createSurveyType();
            this.createPlans();
        } catch (error) {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    init() {
        this.surveyTypeRepo = getDataSource(false).getRepository(SurveyType);
        this.planRepo = getDataSource(false).getRepository(Plan);
        this.toCreatePlanList = [];
        this.planLimits = new Map<string, string>();
        this.planNamePrice = new Map<string, number>();
        this.planNameDescription = new Map<string, string>();
        logger.info('Startup class Initialized.');
    }

    populatePlanLimit() {
        this.planLimits.set(FREE_PLAN, JSON.stringify(
            { activeSurveyLimit: 1, responseStoreLimit: 50, responseCapacity: 50 }
        ));
        this.planLimits.set(STARTER_PLAN, JSON.stringify(
            { activeSurveyLimit: 7, responseStoreLimit: 500, responseCapacity: 500 }
        ));
    }

    populatePlanAmount() {
        this.planNamePrice.set(FREE_PLAN, 0);
        this.planNamePrice.set(STARTER_PLAN, 25);
        // this.planNamePrice.set(GROWTH_PLAN,97);
        // this.planNamePrice.set(ENTERPRISE_PLAN,135);
        // this.planNamePrice.set(ULTIMATE_PLAN,175);
        logger.info('Plan prices populated');
    }

    populatePlanDescription() {
        this.planNameDescription.set(FREE_PLAN, JSON.stringify({
            description: `Get Started for Free: Unlock the Power of FeedbackSense Without Cost`,
            features: [
                '1 Active Surveys',
                '50 Response / month',
                '1 User',
                'Basic analysis',
                'FeedbackSense will always have a free plan'
            ]
        }));
        this.planNameDescription.set(STARTER_PLAN, JSON.stringify({
            description: `Empower your company with a comprehensive solution to streamline customer feedback automation from a single source.`,
            features: [
                '5 Active Surveys',
                '2000 Response / month',
                'Unlimited users',
                'Detailed analysis',
                'Unlimited users'
            ]
        }));

        // this.planNameDescription.set(GROWTH_PLAN, JSON.stringify({
        //     description: `Ideal for businesses seeking advanced research capabilities with robust and sophisticated features.`,
        //     features: [
        //         'Get feedback from 500 customers per month',
        //         '5 active survey',
        //         'All Distribution channel',
        //         'Unlimited free users',
        //         `All from ${STARTER_PLAN}, plus`,
        //         'Slack Notifications',
        //         'Remove FeedbackSense Branding',
        //         'Thank you screen actions',
        //     ]
        // }));

        // this.planNameDescription.set(ENTERPRISE_PLAN, JSON.stringify({
        //     description: `An excellent choice for companies seeking increased flexibility and automation options for their customer feedback workflows.`,
        //     features: [
        //         'Get feedback from 1000 customers per month',
        //         '7 active survey',
        //         'Advanced Targeting',
        //         'Unlimited free users',
        //         'Custom survey design',
        //         `All from ${GROWTH_PLAN}, plus`,
        //         'Google Sheets export',
        //         'Sentiment analysis',
        //         'Conditional notification',
        //     ]

        // }));

        // this.planNameDescription.set(ULTIMATE_PLAN, JSON.stringify({
        //     description: `The perfect solution for companies seeking to centralize and align their teams around customer feedback, all in one unified platform`,
        //     features: [
        //         'Get feedback from 2500 customers per month',
        //         '10 active survey',
        //         'Folder',
        //         'Unlimited free users',
        //         'Custom survey design',
        //         `All from ${ENTERPRISE_PLAN}, plus`,
        //         'Export API feature',
        //         'Team collaboration',
        //         'User roles'
        //     ]

        // }));
        logger.info('Plan description populated.');
    }

    async createPlans() {
        try {
            const planNames: string[] = [
                FREE_PLAN,
                STARTER_PLAN,
                // ULTIMATE_PLAN,
                // GROWTH_PLAN,
                // ENTERPRISE_PLAN
            ];
    
            const planList = await getDataSource(false).createQueryBuilder(Plan, 'plan')
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
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
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
            planObj.description = this.planNameDescription.get(name);
            planObj.sub_limit = this.planLimits.get(name);
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
        }

        // const surveyObj1 = new SurveyType();
        // surveyObj1.label = 'Website or App Survey';
        // surveyObj1.name = 'app/site';
        // this.surveyTypeRepo.save(surveyObj1);

        logger.info('Survey type created.');
    }

}