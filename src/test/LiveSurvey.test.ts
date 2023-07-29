import { Survey } from "../Entity/SurveyEntity";
import { StartUp } from "../Helpers/Startup";
import { getLiveSurveyNodes } from "../Service/LiveSurveyService";
import { createTestSurvey } from "./TestUtils.ts/SurveyTestUtils";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { AppDataSource } from "../Config/AppDataSource";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe("getLiveSurveyNodes", () => {
    test("returns error response when survey does not exist", async () => {
        const response = await getLiveSurveyNodes("fake-survey-id");
        expect(response.statusCode).toBe(410);
        expect(response.success).toBe(false);
        expect(response.message).toBe("Survey not found");
        expect(response.data).toEqual({});
    });

    test("returns error response when survey is not published", async () => {
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        const response = await getLiveSurveyNodes(surveyEntity.id);
        expect(response.statusCode).toBe(410);
        expect(response.success).toBe(false);
        expect(response.message).toBe("This survey is not published");
        expect(response.data).toEqual({});
    });

    test("returns error response when survey is deleted", async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        let surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        surveyEntity.is_deleted = true;
        surveyEntity.is_published = true;
        surveyEntity = await surveyRepo.save(surveyEntity);

        const response = await getLiveSurveyNodes(surveyEntity.id);

        expect(response.statusCode).toBe(410);
        expect(response.success).toBe(false);
        expect(response.message).toBe("This survey is no longer available");
        expect(response.data).toEqual({});

        await surveyRepo.delete({
            id: surveyEntity.id
        });
    });

    test("returns error response when survey is archived", async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        let surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        surveyEntity.is_archived = true;
        surveyEntity.is_published = true;
        surveyEntity = await surveyRepo.save(surveyEntity);

        const response = await getLiveSurveyNodes(surveyEntity.id);

        expect(response.statusCode).toBe(410);
        expect(response.success).toBe(false);
        expect(response.message).toBe("This survey is no longer available");
        expect(response.data).toEqual({});

        await surveyRepo.delete({
            id: surveyEntity.id
        });
    });

    // test("return node list in correct order based on edges", async () => {
    //     const surveyRepo = connection.getRepository(Survey);
    //     const surveyEntity = await createTestSurvey(connection);
    //     surveyEntity.is_archived = false;
    //     surveyEntity.is_deleted = false;
    //     surveyEntity.is_published = true;

    //     const flowObj: Workflow = await createSurveyFlow('{"nodes":[{"width":300,"height":82,"id":"dndnode_075","type":"selectorNode","data":{"uId":"dndnode_075","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome to FeedbackSense\\",\\"buttonText\\":\\"Next\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":333,"y":99.5},"selected":false,"positionAbsolute":{"x":333,"y":99.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_1392","type":"selectorNode","data":{"uId":"dndnode_1392","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"What is your favourite color ?\\",\\"answerList\\":[\\"Red\\",\\"Blue\\",\\"Green\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":327,"y":451.5},"selected":true,"positionAbsolute":{"x":327,"y":451.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_2891","type":"selectorNode","data":{"uId":"dndnode_2891","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"How are you feeling ?\\"}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":350,"y":267.5},"selected":false,"positionAbsolute":{"x":350,"y":267.5},"dragging":false}],"edges":[{"source":"dndnode_075","sourceHandle":"b","target":"dndnode_2891","targetHandle":null,"id":"reactflow__edge-dndnode_075b-dndnode_2891"},{"source":"dndnode_2891","sourceHandle":"b","target":"dndnode_1392","targetHandle":null,"id":"reactflow__edge-dndnode_2891b-dndnode_1392"}],"viewport":{"x":0,"y":0,"zoom":1}}', surveyEntity.id);

    //     surveyEntity.workflow_id = flowObj.id;
    //     await surveyRepo.save(surveyEntity);

    //     const response = await getLiveSurveyNodes(surveyEntity.id);
    //     expect(response.statusCode).toBe(200);
    //     expect(response.success).toBe(true);
    //     expect(response.message).toBe("Survey retrieved");
    //     expect(JSON.stringify(response.data?.nodes)).toEqual('[{"width":300,"height":82,"id":"dndnode_075","type":"selectorNode","data":{"uId":"dndnode_075","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome to FeedbackSense\\",\\"buttonText\\":\\"Next\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":333,"y":99.5},"selected":false,"positionAbsolute":{"x":333,"y":99.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_2891","type":"selectorNode","data":{"uId":"dndnode_2891","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"How are you feeling ?\\"}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":350,"y":267.5},"selected":false,"positionAbsolute":{"x":350,"y":267.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_1392","type":"selectorNode","data":{"uId":"dndnode_1392","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"What is your favourite color ?\\",\\"answerList\\":[\\"Red\\",\\"Blue\\",\\"Green\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":327,"y":451.5},"selected":true,"positionAbsolute":{"x":327,"y":451.5},"dragging":false}]');

    // });
})