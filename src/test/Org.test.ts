import { AppDataSource } from "../Config/AppDataSource";
import { Organization } from "../Entity/OrgEntity";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { StartUp } from "../Helpers/Startup";
import { createOrganizationForUser, getAllOrgList } from "../Service/OrgService";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createTestUser } from "./TestUtils.ts/UserTestUtils";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Basic Org test' , () => {

    test('Create Org For User' , async() => {
        const testUser = await createTestUser(AppDataSource.getDataSource());
        const response = await createOrganizationForUser(testUser,{
            orgName : 'FeedbackSense',
            address : 'Delhi',
            country : 'India',
            pinCode : '40001'
        });
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);

        const orgRepo = AppDataSource.getDataSource().getRepository(Organization);
        const createdOrg = await orgRepo.findOne({
            where : {
                name : 'FeedbackSense'
            }
        });
        expect(createdOrg != null).toBe(true);
        
        await CustomSettingsHelper.getInstance(createdOrg.id).initialize();
        const settingsData = CustomSettingsHelper.getInstance(createdOrg.id).settings;
        expect(settingsData['removeFeedbackLogo']).toBe('false');
        expect(settingsData['activeSurveyLimit']).toBe('1');
        expect(settingsData['folderFeatureActive']).toBe('true');
        expect(settingsData['surveyResponseCapacity']).toBe('500');
    });

    test('Get all org list', async() => {
        const response = await getAllOrgList();
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
        
        const data :Organization[] = response.data;
        expect(data.length).toBe(1);
        expect(data[0].name).toBe('FeedbackSense');
    })

});