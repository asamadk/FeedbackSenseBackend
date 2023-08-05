import { AppDataSource } from "../Config/AppDataSource";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { StartUp } from "../Helpers/Startup";
import { createFolders } from "../Service/FolderService";
import { createSurvey, getAllSurveys, getDetailedSurvey, moveSurveyToFolder } from "../Service/SurveyService";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createCompleteUser } from "./TestUtils.ts/UserTestUtils";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Test Survey creation',() => {
    
    test('Test create survey',async() => {
        const user = await createCompleteUser('test@user.com');
        AuthUserDetails.getInstance().setUserDetails(user);
        const response = await createSurvey('TEMP_SURVEY',user);
        expect(response.statusCode).toBe(200);
        expect(response.success).toBe(true);

        const surveyList = await getAllSurveys('test@user.com');
        expect(surveyList.success).toBe(true);
        expect(surveyList.statusCode).toBe(200);
        expect(surveyList.data.length).toBe(1);
        const surveyObj = surveyList.data[0];
        expect(surveyObj.name).toBe('TEMP_SURVEY');
        expect(surveyObj.user_id).toBe(user.id);
        expect(surveyObj.username).toBe('Jane Smith');
        await createSurvey('TEMP_SURVEY_1',user);
    });

    test('Test same name survey creation',async () => {
        const user = await createCompleteUser('test1@user.com');
        AuthUserDetails.getInstance().setUserDetails(user);
        const response = await createSurvey('TEMP_SURVEY',user);
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(500);
        expect(response.message).toBe('Survey already exist with this name');
    });

    test('Test get detailed survey',async() => {
        const user = await createCompleteUser('test2@user.com');
        AuthUserDetails.getInstance().setUserDetails(user);
        const response = await createSurvey('TEMP_SURVEY_2',user);
        const response1 = await getDetailedSurvey(response.data.id);
        
        expect(response1.success).toBe(true);
        expect(response1.statusCode).toBe(200);
        expect(response1.message).toBe('Survey retrieved successfully');
        const surveyObj1 = response1.data;
        expect(surveyObj1.name).toBe('TEMP_SURVEY_2');
        expect(surveyObj1.user_id).toBe(user.id);
        expect(surveyObj1.workflow_id).toBe(null);
        expect(surveyObj1.surveyType.name).toBe('email/link');
        expect(surveyObj1.workflows.length).toBe(0);
    });

    test('Test org wise survey fetch',async () => {
        const response1 = await getAllSurveys('test2@user.com');
        expect(response1.data.length).toBe(1);

        const response2 = await getAllSurveys('test@user.com');
        expect(response2.data.length).toBe(2);
    });

    test('Test invalid user creates survey', async () => {
        const response1 = await createSurvey('TEST',null);
        expect(response1.success).toBe(false);
        expect(response1.statusCode).toBe(404);
        expect(response1.message).toBe('User not found');
    });

    test('Move survey to folder',async () => {
        const user = await createCompleteUser('test3@user.com');
        const response = await createSurvey('TEMP_SURVEY_3',user);
        const response1 = await getDetailedSurvey(response.data.id);
        
        const res = await createFolders('FOLDER_1','test2@user.com');
        const movedResponse = await moveSurveyToFolder(res.data.id,response1.data.id);
        expect(movedResponse.data.folder_id).toBe(res.data.id);

        const res2 = await createFolders('FOLDER_2','test2@user.com');
        const movedResponse1 = await moveSurveyToFolder(res2.data.id,response1.data.id);
        expect(movedResponse1.data.folder_id).toBe(res2.data.id);
    });

    //TODO start from enable disable survey
})