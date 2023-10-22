import { AppDataSource } from "../Config/AppDataSource";
import { ACTIVE_SURVEY_LIMIT, FOLDER_FEATURE_ACTIVE, REMOVE_FEEDBACK_SENSE_LOGO, SURVEY_RESPONSE_CAPACITY } from "../Constants/CustomSettingsCont";
import { CustomSettings } from "../Entity/CustomSettingsEntity";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { StartUp } from "../Helpers/Startup";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createCompleteUser} from "./TestUtils.ts/UserTestUtils";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Initial custom settings tests', () => {

    test('Create default custom settings',async () => {
        const customSettingsRepo = AppDataSource.getDataSource().getRepository(CustomSettings);
        const user = await createCompleteUser('test@gmail.com');
        let customSettingHelper = CustomSettingsHelper.getInstance();
        await customSettingHelper.initialize(user.organization_id);
        
        const activeSurveyLimit = customSettingHelper.getCustomSettings(ACTIVE_SURVEY_LIMIT);
        const folderFeatureActive = customSettingHelper.getCustomSettings(FOLDER_FEATURE_ACTIVE);
        const surveyResponseCapacity = customSettingHelper.getCustomSettings(SURVEY_RESPONSE_CAPACITY);
        const removeFeedbackLogo = customSettingHelper.getCustomSettings(REMOVE_FEEDBACK_SENSE_LOGO);

        expect(activeSurveyLimit).toBe('1');
        expect(folderFeatureActive).toBe('true');
        expect(surveyResponseCapacity).toBe('500');
        expect(removeFeedbackLogo).toBe('false');

        customSettingHelper.setCustomSettings(ACTIVE_SURVEY_LIMIT,'10');
        await customSettingHelper.saveCustomSettings();

        expect(customSettingHelper.getCustomSettings(ACTIVE_SURVEY_LIMIT)).toBe('10');
        
        const activeSurveySetting = await customSettingsRepo.findOne({
            where : {
                fKey : ACTIVE_SURVEY_LIMIT,
                organizationId : user.organization_id
            }
        });
        expect(activeSurveySetting.fValue).toBe('10');

        const user2 = await createCompleteUser('test2@gmail.com');
        CustomSettingsHelper.instance = null;
        customSettingHelper = CustomSettingsHelper.getInstance();
        await customSettingHelper.initialize(user2.organization_id);
        expect(customSettingHelper.getCustomSettings(ACTIVE_SURVEY_LIMIT)).toBe('1');

        customSettingHelper.setCustomSettings(SURVEY_RESPONSE_CAPACITY,'2000');
        await customSettingHelper.saveCustomSettings();

        const surveyResponseCap = await customSettingsRepo.findOne({
            where : {
                fKey : SURVEY_RESPONSE_CAPACITY,
                organizationId : user2.organization_id
            }
        });
        expect(surveyResponseCap.fValue).toBe('2000');
    });

    test('should return the same instance for the same organization ID', () => {
        const instance1 = CustomSettingsHelper.getInstance();
        const instance2 = CustomSettingsHelper.getInstance();
        expect(instance1).toEqual(instance2);
    });

    test('should initialize the custom settings correctly', async () => {
        const user = await createCompleteUser('test1@gmail.com');
        const instance = CustomSettingsHelper.getInstance();
        await instance.initialize(user.organization_id);
        expect(instance.settings != null);
    });

});