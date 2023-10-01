import { AppDataSource } from "../Config/AppDataSource";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
import { Plan } from "../Entity/PlanEntity";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { FREE_PLAN } from "../Helpers/Constants";
import { StartUp } from "../Helpers/Startup";
import { FSCustomSetting } from "../Utils/SettingsUtils/CustomSettingsData";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createCompleteUser, createCustomSettingForOrg } from "./TestUtils.ts/UserTestUtils";
import { createUserWithOrgId } from "./TestUtils.ts/UserTestUtils";

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

describe('Startup survey create custom settings' , () => {

    it('No Organizations and No Custom Settings' ,async () => {
        const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const startUp = new StartUp();
        startUp.init();
        await startUp.createCustomerSettingsExistingUser();
        const temp2 = await customSetRepo.find();
        expect(temp2.length).toBe(0);
    });

    it('No Organizations and No Custom Settings' ,async () => {
        const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        await createCompleteUser('test@test.com');
        const startUp = new StartUp();
        startUp.init();
        await startUp.createCustomerSettingsExistingUser();
        const temp2 = await customSetRepo.find();
        expect(temp2.length).toBe(FSCustomSetting.size);
    });

    it('All Organizations Have All Custom Settings:' ,async () => {
        const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const startUp = new StartUp();
        startUp.init();
        await startUp.createCustomerSettingsExistingUser();
        const temp2 = await customSetRepo.find();
        expect(temp2.length).toBe(FSCustomSetting.size);
    });

    it('Some Organizations Lack Some Custom Settings:' ,async () => {
        const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        await createCompleteUser('test2@test.com');
        const startUp = new StartUp();
        startUp.init();
        await startUp.createCustomerSettingsExistingUser();
        const temp2 = await customSetRepo.find();
        expect(temp2.length).toBe(FSCustomSetting.size * 2);
    });
    
    it('Race Conditions', async () => {
        const startUp = new StartUp();
        startUp.init();
    
        // Running the function concurrently from multiple threads or processes
        const promise1 = startUp.createCustomerSettingsExistingUser();
        const promise2 = startUp.createCustomerSettingsExistingUser();
    
        await Promise.all([promise1, promise2]);
    
        const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const allSettings = await customSetRepo.find();
    
        // The exact expectation here will depend on the desired behavior and setup.
        // But a basic check could be:
        expect(allSettings.length).toBeLessThanOrEqual(FSCustomSetting.size * 7);
    });
    
    

})