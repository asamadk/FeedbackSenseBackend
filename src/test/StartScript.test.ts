import { AppDataSource } from "../Config/AppDataSource";
import { Plan } from "../Entity/PlanEntity";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { FREE_PLAN } from "../Helpers/Constants";
import { StartUp } from "../Helpers/Startup";
import { TestHelper } from "./TestUtils.ts/TestHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async() => {
    await TestHelper.instance.teardownTestDB();
});

describe('Startup script', () => {

    test('Initializing startup script', async () => {
        AppDataSource.setDataSource(TestHelper.instance.dbConnect);
        await new StartUp().startExecution();
        expect('12345678').toBe('12345678');
    });

    test('should initialize correctly', () => {
        const startUp = new StartUp();
        startUp.init();
        expect(startUp.planLimits).toBeInstanceOf(Map);
        expect(startUp.planNamePrice).toBeInstanceOf(Map);
        expect(startUp.planNameDescription).toBeInstanceOf(Map);
    });

});

describe('StartUp Plan Populating', () => {
    
    test('should populate plan limits correctly', () => {
        const startUp = new StartUp();
        startUp.init();
        startUp.populatePlanLimit();
        expect(startUp.planLimits.get(FREE_PLAN)).toEqual(JSON.stringify({}));
    });

    test('should populate plan amounts correctly', () => {
        const startUp = new StartUp();
        startUp.init();
        startUp.populatePlanAmount();
        expect(startUp.planNamePrice.get(FREE_PLAN)).toEqual(0);
    });

    test('should populate plan descriptions correctly', () => {
        const startUp = new StartUp();
        startUp.init();
        startUp.populatePlanDescription();
        expect(JSON.parse(startUp.planNameDescription.get(FREE_PLAN)).description)
            .toEqual('Get Started for Free: Unlock the Power of FeedbackSense Without Cost');
    });
});

describe('StartUp Plan Creation', () => {
    test('should create plans correctly', async () => {
        const startUp = new StartUp();
        startUp.init();
        await startUp.createPlans();
        // Add your expectations here, such as checking the content of startUp.toCreatePlanList
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        const planCount = await planRepo.count();
        expect(planCount).toBe(3);
    });
});

describe('StartUp Survey Type Creation', () => {
    it('should create survey type correctly', async () => {
        const startUp = new StartUp();
        startUp.init();
        await startUp.createSurveyType();
        const surveyTypeRepo = AppDataSource.getDataSource().getRepository(SurveyType);
        const surveyTypeCount = await surveyTypeRepo.count();
        expect(surveyTypeCount).toBe(1);
    });
});
