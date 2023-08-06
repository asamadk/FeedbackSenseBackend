import { AppDataSource } from "../Config/AppDataSource";
import { ACTIVE_SURVEY_LIMIT } from "../Constants/CustomSettingsCont";
import { Subscription } from "../Entity/SubscriptionEntity";
import { Survey } from "../Entity/SurveyEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { StartUp } from "../Helpers/Startup";
import { createFolders } from "../Service/FolderService";
import { checkIfSurveyHasResponse, createSurvey, enableDisableSurvey, getAllSurveys, getDetailedSurvey, moveSurveyToFolder, permDeleteSurvey, saveSurveyDesign, saveSurveyFlow } from "../Service/SurveyService";
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
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('Survey created successfully');

        const failedResponse = await createSurvey('TEMP_SURVEY',user);
        expect(failedResponse.success).toBe(false);
        expect(failedResponse.statusCode).toBe(500);
        expect(failedResponse.message).toBe('Survey already exist with this name');
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

    test('Delete surveys',async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveys = await surveyRepo.find();
        const surveyIds :string[]= [];
        surveys.forEach(survey => {
            surveyIds.push(survey.id);
        });
        for(const surveyId of surveyIds){
            await permDeleteSurvey(surveyId);
        }
        const remainingSurveys = await surveyRepo.find();
        expect(remainingSurveys.length).toBe(0);

        const response = await permDeleteSurvey('invalid_survey_id');
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(404);
        expect(response.message).toBe('The survey does not exists');
    });
    
    test('Enable disable survey',async () => {
        const user = await createCompleteUser('test4@user.com');
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        await createSurvey('TEMP_SURVEY_3',user);
        const surveyObj = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        const response = await enableDisableSurvey(surveyObj.id,true);
        expect(surveyObj.is_published).toBe(false);
        expect(response.success).toBe(false);
        expect(response.message).toBe('Cannot publish. Survey is empty.');
    
        await saveSurveyFlow(
            surveyObj.id,
            '{"nodes":[{"width":300,"height":82,"id":"dndnode_6450","type":"selectorNode","data":{"uId":"dndnode_6450","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Test\\",\\"answerList\\":[\\"Answer 1\\",\\"Answer 2\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":404,"y":384.20000000000005},"selected":false,"positionAbsolute":{"x":404,"y":384.20000000000005},"dragging":false},{"width":300,"height":82,"id":"dndnode_0964","type":"selectorNode","data":{"uId":"dndnode_0964","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome\\",\\"buttonText\\":\\"start\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":389,"y":19},"selected":false,"positionAbsolute":{"x":389,"y":19},"dragging":false},{"width":300,"height":82,"id":"dndnode_0559","type":"selectorNode","data":{"uId":"dndnode_0559","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"Qu\\"}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":392,"y":187},"selected":false,"positionAbsolute":{"x":392,"y":187},"dragging":false}],"edges":[{"source":"dndnode_0964","sourceHandle":"b","target":"dndnode_0559","targetHandle":null,"id":"reactflow__edge-dndnode_0964b-dndnode_0559"},{"source":"dndnode_0559","sourceHandle":"b","target":"dndnode_6450","targetHandle":null,"id":"reactflow__edge-dndnode_0559b-dndnode_6450"}],"viewport":{"x":54,"y":-379,"zoom":1}}'
            ,false
        );

        const response1 = await enableDisableSurvey(surveyObj.id,true);
        const surveyObj2 = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        expect(surveyObj2.is_published).toBe(true);
        expect(response1.success).toBe(true);
        expect(response1.message).toBe('Survey  enabled  successfully');
        
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
        const subscriptionObj: Subscription = await subscriptionRepo.findOneBy({
            user: { id: user.id }
        });
        expect(subscriptionObj).toBe(null);

        const response2 = await enableDisableSurvey(surveyObj.id,false);
        expect(response2.success).toBe(true);
        expect(response2.message).toBe('Survey  disabled  successfully');

        const surveyObj3 = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        expect(surveyObj3.is_published).toBe(false);
    });

    test('Test if survey has responses',async() => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyObj = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        const response = await checkIfSurveyHasResponse(surveyObj.id);
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.data.alreadyHasResponse).toBe(false);
    });

    test('Test save survey design',async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyObj = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        const response = await saveSurveyDesign(surveyObj.id,'');
        expect(response.message).toBe('Survey design not found.');
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(500);

        await saveSurveyDesign(
            surveyObj.id,
            '{"theme":{"id":5,"header":"Deep pink ","text":"Classic","color":["#e715ff","#FEE715FF"],"shade":"#fad0ff","textColor":"#ffffff"},"background":{"id":14,"name":"Dotted","value":"dot"}}'
        );
        const surveyObj2 = await surveyRepo.findOne({
            where : {
                name : 'TEMP_SURVEY_3'
            }
        });
        expect(surveyObj2.survey_design_json).toBe('{"theme":{"id":5,"header":"Deep pink ","text":"Classic","color":["#e715ff","#FEE715FF"],"shade":"#fad0ff","textColor":"#ffffff"},"background":{"id":14,"name":"Dotted","value":"dot"}}');
    });

    //TODO test continue from updateSurveyConfig
})