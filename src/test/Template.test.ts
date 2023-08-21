import { Repository } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { Templates } from "../Entity/TemplateEntity";
import { StartUp } from "../Helpers/Startup";
import { createSurveyFromTemplate, getTemplateDetails, getTemplateTestDisplay } from "../Service/TemplateService";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { Survey } from "../Entity/SurveyEntity";
import { createCompleteUser } from "./TestUtils.ts/UserTestUtils";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { USER_UNAUTH_TEXT } from "../Helpers/Constants";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
    templateRepo = AppDataSource.getDataSource().getRepository(Templates);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

let templateRepo: Repository<Templates>;

describe('Test basic service functions', () => {

    test('Test get template details ', async () => {
        const response = await getTemplateDetails();
        expect(response.message).toBe('Templates fetched successfully.');
        expect(response.statusCode).toBe(200);

        const resData: Templates[] = response.data;
        expect(resData.length).toBe(1);
    });

    test('Test template display', async () => {
        const template = new Templates();
        template.name = 'TEST_TEMPLATE';
        template.category = 'TEST_CAT';
        template.description = 'TEST_DESC';
        template.questionCount = 4;
        template.subCategory = 'TEST_SUB_CAT';
        template.timeTaken = 5;
        template.data = '{"nodes":[{"width":300,"height":82,"id":"dndnode_6450","type":"selectorNode","data":{"uId":"dndnode_6450","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Test\\",\\"answerList\\":[\\"Answer 1\\",\\"Answer 2\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":404,"y":384.20000000000005},"selected":true,"positionAbsolute":{"x":404,"y":384.20000000000005},"dragging":false},{"width":300,"height":82,"id":"dndnode_0964","type":"selectorNode","data":{"uId":"dndnode_0964","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome\\",\\"buttonText\\":\\"start\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":389,"y":19},"selected":false,"positionAbsolute":{"x":389,"y":19},"dragging":false},{"width":300,"height":82,"id":"dndnode_0559","type":"selectorNode","data":{"uId":"dndnode_0559","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"Qu\\"}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":392,"y":187},"selected":false,"positionAbsolute":{"x":392,"y":187},"dragging":false},{"width":300,"height":82,"id":"dndnode_2203","type":"selectorNode","data":{"uId":"dndnode_2203","compId":4,"label":"Multiple answer selection","description":"Let people choose multiple answers from a list. Use it when more than one answer applies.","compConfig":"{\\"question\\":\\"Multiple\\",\\"answerList\\":[\\"new\\",\\"old\\"],\\"type\\":\\"multiple\\"}"},"style":{"color":"#F26419","border":"1px #F26419 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":406,"y":617},"selected":false,"dragging":false,"positionAbsolute":{"x":406,"y":617}}],"edges":[{"source":"dndnode_0964","sourceHandle":"b","target":"dndnode_0559","targetHandle":null,"id":"reactflow__edge-dndnode_0964b-dndnode_0559"},{"source":"dndnode_0559","sourceHandle":"b","target":"dndnode_6450","targetHandle":null,"id":"reactflow__edge-dndnode_0559b-dndnode_6450"},{"source":"dndnode_6450","sourceHandle":"b","target":"dndnode_2203","targetHandle":null,"id":"reactflow__edge-dndnode_6450b-dndnode_2203"}],"viewport":{"x":-10,"y":-134,"zoom":1}}';
        template.design_json = '{"theme": {"id": 5,"text": "Classic","color": ["#e715ff","#FEE715FF"],"shade": "#fad0ff","header": "Deep pink ","textColor": "#ffffff"},"background": {"id": 14,"name": "Dotted","value": "dot"}}';
        await templateRepo.save(template);

        const response = await getTemplateTestDisplay(template.id);
        expect(response.message).toBe('Templates display fetched successfully.');
        expect(response.statusCode).toBe(200);

        const resData = response.data;
        expect(resData.background.name).toBe('Dotted');
        expect(resData.background.value).toBe('dot');
        expect(resData.theme.text).toBe('Classic');
        expect(resData.theme.color.length).toBeGreaterThan(1);
        expect(resData.theme.shade).toBe('#fad0ff');
        expect(resData.theme.header).toBe('Deep pink ');

        const nodes: any[] = resData.nodes;
        expect(nodes.length).toBe(4);
        expect(nodes[0].data.label).toBe('Welcome message');
        expect(nodes[1].data.label).toBe('Text answer');
        expect(nodes[2].data.label).toBe('Single answer selection');
        expect(nodes[3].data.label).toBe('Multiple answer selection');
    });

    test('Test non-existent template display', async () => {
        try {
            await getTemplateTestDisplay('nonexistentID');
        } catch (err) {
            expect(err.message).toBe('Template not found.');
        }
    });


    test('Test invalid JSON format', async () => {
        const template = new Templates();
        template.design_json = '{"theme": invalid';
        template.data = 'invalid}';
        template.name = 'TEST_TEMPLATE_1';
        template.category = 'TEST_CAT';
        template.description = 'TEST_DESC';
        template.questionCount = 4;
        template.subCategory = 'TEST_SUB_CAT';
        template.timeTaken = 5;
        await templateRepo.save(template);
        try {
            await getTemplateTestDisplay(template.id);
        } catch (err) {
            expect(err.message).toContain('Unexpected token');
        }
    });

    test('Test missing fields', async () => {
        const template = new Templates();
        template.design_json = '{"background": {"name": "Dotted","value": "dot"}}';
        template.data = '{"nodes":[]}';
        template.name = 'TEST_TEMPLATE_2';
        template.category = 'TEST_CAT';
        template.description = 'TEST_DESC';
        template.questionCount = 4;
        template.subCategory = 'TEST_SUB_CAT';
        template.timeTaken = 5;
        await templateRepo.save(template);

        try {
            await getTemplateTestDisplay(template.id);
        } catch (error) {
            expect(error.message).toContain('edges is not iterable');
        }
    });

    test('Test template with no nodes and edges', async () => {
        const template = new Templates();
        template.design_json = '{"theme": {"text": "Classic"}}';
        template.data = '{"nodes":[], "edges":[]}';
        template.name = 'TEST_TEMPLATE_3';
        template.category = 'TEST_CAT';
        template.description = 'TEST_DESC';
        template.questionCount = 4;
        template.subCategory = 'TEST_SUB_CAT';
        template.timeTaken = 5;
        await templateRepo.save(template);

        const response = await getTemplateTestDisplay(template.id);
        expect(response.message).toBe('Templates display fetched successfully.');
        expect(response.statusCode).toBe(200);
    });

});

describe('Survey Creation from Template Tests', () => {

    test('Create survey from template', async () => {
        const template = new Templates();
        template.design_json = '{"theme": {"text": "Classic"}}';
        template.data = '{"nodes":[]}';
        template.name = 'TEST_TEMPLATE_4';
        template.category = 'TEST_CAT';
        template.description = 'TEST_DESC';
        template.questionCount = 4;
        template.subCategory = 'TEST_SUB_CAT';
        template.timeTaken = 5;
        await templateRepo.save(template);

        const user = await createCompleteUser('user_template@user.com');
        AuthUserDetails.getInstance().setUserDetails(user);

        const response = await createSurveyFromTemplate(template.id);
        expect(response.message).toBe('Survey created successfully.');
        expect(response.data.surveyId).toBeDefined();

        const surveyId = response.data.surveyId;
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const survey = await surveyRepo.findOneBy({id : surveyId});

        expect(survey != null);
        expect(survey.name).toContain(`${template.name} - Template`)
    });

    test('Try to create a survey from a non-existent template', async () => {
        try {
            await createSurveyFromTemplate('nonexistentID');
        } catch (err) {
            expect(err.message).toBe('Template not found.');
        }
    });

    test('Try to create a survey without an authenticated user', async () => {
        // Assuming that setting AuthUserDetails to null will simulate this situation.
        const user = AuthUserDetails.getInstance().getUserDetails();
        AuthUserDetails.getInstance().setUserDetails(null);
        const template = await templateRepo.findOne({where : {name : 'TEST_TEMPLATE_4'}});
        try {
            await createSurveyFromTemplate(template.id);
        } catch (err) {
            expect(err.message).toBe(USER_UNAUTH_TEXT);
        }
        AuthUserDetails.getInstance().setUserDetails(user);
    });
});

