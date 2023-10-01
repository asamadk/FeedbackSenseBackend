import { Survey } from "../Entity/SurveyEntity";
import { StartUp } from "../Helpers/Startup";
import { getLiveSurveyNodes } from "../Service/LiveSurveyService";
import { createTestSurvey } from "./TestUtils.ts/SurveyTestUtils";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { AppDataSource } from "../Config/AppDataSource";
import { Workflow } from "../Entity/WorkflowEntity";
import { createSurveyFlow } from "../Service/SurveyService";
import { LiveSurveyNodes } from "../Types/SurveyTypes";

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

    test("return node list in correct order based on edges", async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        surveyEntity.is_archived = false;
        surveyEntity.is_deleted = false;
        surveyEntity.is_published = true;

        const flowObj: Workflow = await createSurveyFlow('{"nodes":[{"width":300,"height":82,"id":"dndnode_075","type":"selectorNode","data":{"uId":"dndnode_075","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome to FeedbackSense\\",\\"buttonText\\":\\"Next\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":333,"y":99.5},"selected":false,"positionAbsolute":{"x":333,"y":99.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_1392","type":"selectorNode","data":{"uId":"dndnode_1392","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"What is your favourite color ?\\",\\"answerList\\":[\\"Red\\",\\"Blue\\",\\"Green\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":327,"y":451.5},"selected":true,"positionAbsolute":{"x":327,"y":451.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_2891","type":"selectorNode","data":{"uId":"dndnode_2891","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"How are you feeling ?\\"}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":350,"y":267.5},"selected":false,"positionAbsolute":{"x":350,"y":267.5},"dragging":false}],"edges":[{"source":"dndnode_075","sourceHandle":"b","target":"dndnode_2891","targetHandle":null,"id":"reactflow__edge-dndnode_075b-dndnode_2891"},{"source":"dndnode_2891","sourceHandle":"b","target":"dndnode_1392","targetHandle":null,"id":"reactflow__edge-dndnode_2891b-dndnode_1392"}],"viewport":{"x":0,"y":0,"zoom":1}}', surveyEntity.id);

        surveyEntity.workflow_id = flowObj.id;
        await surveyRepo.save(surveyEntity);

        const response = await getLiveSurveyNodes(surveyEntity.id);
        expect(response.statusCode).toBe(200);
        expect(response.success).toBe(true);
        expect(response.message).toBe("Survey retrieved");

        expect(response.data.background).toBe(undefined);
        expect(response.data.theme).toBe(undefined);

        const nodes: LiveSurveyNodes[] = response.data.nodes;

        expect(nodes.length).toBe(3);
        expect(nodes[0].paths.length).toBeGreaterThan(0);
        expect(nodes[0].isStartingNode).toBe(true);

        expect(nodes[1].paths.length).toBe(0);
        expect(nodes[1].isStartingNode).toBe(false);

        expect(nodes[2].paths.length).toBeGreaterThan(0);
        expect(nodes[2].isStartingNode).toBe(false);

    });

    test('Test skip logic dry run ', async () => {
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());

        surveyEntity.is_archived = false;
        surveyEntity.is_deleted = false;
        surveyEntity.is_published = true;

        const flowObj: Workflow = await createSurveyFlow(
            '{"nodes":[{"width":300,"height":82,"id":"dndnode_14291","type":"selectorNode","data":{"uId":"dndnode_14291","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"Answer\\",\\"logic\\":[{\\"id\\":\\"980dce55-5761-4808-9e71-fbbba41386fc\\",\\"operator\\":\\"answer contains\\",\\"path\\":\\"Contains\\",\\"value\\":\\"samad,ninja\\",\\"showValue\\":true},{\\"id\\":\\"0fb19195-ceb6-485c-8dc4-257bca64a87b\\",\\"operator\\":\\"answer has any value\\",\\"path\\":\\"Any val\\",\\"value\\":\\"\\",\\"showValue\\":false}],\\"existing\\":true}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":437.09844058117073,"y":215.67732560678593},"selected":false,"positionAbsolute":{"x":437.09844058117073,"y":215.67732560678593},"dragging":false},{"width":300,"height":82,"id":"dndnode_2353","type":"selectorNode","data":{"uId":"dndnode_2353","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"sda\\",\\"buttonText\\":\\"next\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":438.86215873015874,"y":59.212063492063464},"selected":false,"positionAbsolute":{"x":438.86215873015874,"y":59.212063492063464},"dragging":false},{"width":300,"height":82,"id":"dndnode_5541","type":"selectorNode","data":{"uId":"dndnode_5541","compId":13,"label":"Date","description":"Let people enter a specific date. This component is useful in areas where people need to select date/time","compConfig":"{\\"question\\":\\"Date\\",\\"logic\\":[{\\"id\\":\\"bca64c2e-9496-4721-8de4-bfb9b32cbde8\\",\\"operator\\":\\"answer has any value\\",\\"path\\":\\"any value\\",\\"value\\":\\"\\",\\"showValue\\":false}],\\"existing\\":true}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":830.6634981103552,"y":375.13460075585795},"selected":false,"positionAbsolute":{"x":830.6634981103552,"y":375.13460075585795},"dragging":false},{"width":300,"height":82,"id":"dndnode_6167","type":"selectorNode","data":{"uId":"dndnode_6167","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome\\",\\"buttonText\\":\\"next\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":489,"y":499.79999999999995},"selected":false,"positionAbsolute":{"x":489,"y":499.79999999999995},"dragging":false},{"width":300,"height":82,"id":"dndnode_9145","type":"selectorNode","data":{"uId":"dndnode_9145","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"as\\",\\"answerList\\":[\\"a\\"],\\"type\\":\\"single\\",\\"logic\\":[{\\"id\\":\\"3875d57a-33ed-48bb-8341-3533b254f158\\",\\"operator\\":\\"is\\",\\"path\\":\\"path\\",\\"value\\":\\"a\\",\\"showValue\\":true}],\\"existing\\":true}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":169,"y":456.79999999999995},"selected":false,"positionAbsolute":{"x":169,"y":456.79999999999995},"dragging":false},{"width":300,"height":82,"id":"dndnode_1871","type":"selectorNode","data":{"uId":"dndnode_1871","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome\\",\\"buttonText\\":\\"x\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":133,"y":721.8},"selected":false,"positionAbsolute":{"x":133,"y":721.8},"dragging":false},{"width":300,"height":82,"id":"dndnode_2121","type":"selectorNode","data":{"uId":"dndnode_2121","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"xx\\",\\"buttonText\\":\\"x\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":481,"y":717.8},"selected":false,"positionAbsolute":{"x":481,"y":717.8},"dragging":false},{"width":300,"height":82,"id":"dndnode_0879","type":"selectorNode","data":{"uId":"dndnode_0879","compId":8,"label":"NPS","description":"Measure brand loyalty on a scale from 0 to 10 and get a predictor of repurchases & referrals.","compConfig":"{\\"question\\":\\"Recommend ?\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"logic\\":[],\\"existing\\":true}"},"style":{"color":"#E4DCCF","border":"1px #E4DCCF solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":829.630054925674,"y":599.3315027462837},"selected":false,"positionAbsolute":{"x":829.630054925674,"y":599.3315027462837},"dragging":false},{"width":300,"height":82,"id":"dndnode_1879","type":"selectorNode","data":{"uId":"dndnode_1879","compId":6,"label":"Smiley scale","description":"Ask people to rate something on a visual smiley scale. .","compConfig":"{\\"question\\":\\"Happy ?\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"logic\\":[],\\"existing\\":true}"},"style":{"color":"#EA8FEA","border":"1px #EA8FEA solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":1164.6080878810783,"y":557.3534697908793},"selected":false,"positionAbsolute":{"x":1164.6080878810783,"y":557.3534697908793},"dragging":false},{"width":300,"height":82,"id":"p-675e7202-087d-4ca3-9c1f-6d8fe2b119de","type":"selectorNode","data":{"uId":"p-675e7202-087d-4ca3-9c1f-6d8fe2b119de","compId":4,"label":"Multiple answer selection","description":"Let people choose multiple answers from a list. Use it when more than one answer applies.","compConfig":"{\\"question\\":\\"Logic test\\",\\"answerList\\":[\\"First\\",\\"Second\\"],\\"type\\":\\"multiple\\",\\"logic\\":[{\\"id\\":\\"4c3b6d46-dea7-476c-adbd-d96ade9e1abc\\",\\"operator\\":\\"is exactly\\",\\"path\\":\\"Is Exactly\\",\\"value\\":\\"First\\",\\"showValue\\":true}],\\"existing\\":true}"},"style":{"color":"#F26419","border":"1px #F26419 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":137,"y":863},"selected":false,"positionAbsolute":{"x":137,"y":863},"dragging":false},{"width":300,"height":82,"id":"p-3c8bfcd1-bbc6-4f0b-99c0-7892fa9c0e47","type":"selectorNode","data":{"uId":"p-3c8bfcd1-bbc6-4f0b-99c0-7892fa9c0e47","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Answer is exactly\\",\\"buttonText\\":\\"yo\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":14,"y":1024},"selected":false,"positionAbsolute":{"x":14,"y":1024},"dragging":false},{"width":300,"height":82,"id":"p-b16c8dc6-6069-4ad1-a3af-f6856bdab99e","type":"selectorNode","data":{"uId":"p-b16c8dc6-6069-4ad1-a3af-f6856bdab99e","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Default\\",\\"buttonText\\":\\"d\\",\\"existing\\":true}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":330,"y":1021},"selected":false,"positionAbsolute":{"x":330,"y":1021},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_9145","target":"dndnode_1871","label":"path","id":"reactflow__edge-dndnode_9145bottom-handle-dndnode_1871top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle","selected":false},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_9145","target":"dndnode_2121","label":"default","id":"reactflow__edge-dndnode_9145bottom-handle-dndnode_2121top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_5541","target":"dndnode_1879","label":"default","id":"reactflow__edge-dndnode_5541bottom-handle-dndnode_1879top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_14291","target":"dndnode_9145","label":"Contains","sourceHandle":"bottom-handle","targetHandle":"top-handle","id":"reactflow__edge-dndnode_14291bottom-handle-dndnode_9145top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_14291","target":"dndnode_6167","label":"Any val","sourceHandle":"bottom-handle","targetHandle":"top-handle","id":"reactflow__edge-dndnode_14291bottom-handle-dndnode_6167top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_1871","sourceHandle":"bottom-handle","target":"p-675e7202-087d-4ca3-9c1f-6d8fe2b119de","targetHandle":"top-handle","id":"reactflow__edge-dndnode_1871bottom-handle-p-675e7202-087d-4ca3-9c1f-6d8fe2b119detop-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-675e7202-087d-4ca3-9c1f-6d8fe2b119de","target":"p-3c8bfcd1-bbc6-4f0b-99c0-7892fa9c0e47","label":"Is Exactly","id":"reactflow__edge-p-675e7202-087d-4ca3-9c1f-6d8fe2b119debottom-handle-p-3c8bfcd1-bbc6-4f0b-99c0-7892fa9c0e47top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-675e7202-087d-4ca3-9c1f-6d8fe2b119de","target":"p-b16c8dc6-6069-4ad1-a3af-f6856bdab99e","label":"default","id":"reactflow__edge-p-675e7202-087d-4ca3-9c1f-6d8fe2b119debottom-handle-p-b16c8dc6-6069-4ad1-a3af-f6856bdab99etop-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_14291","target":"dndnode_5541","label":"default","sourceHandle":"bottom-handle","targetHandle":null,"id":"reactflow__edge-dndnode_14291bottom-handle-dndnode_5541"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_5541","target":"dndnode_0879","label":"any value","sourceHandle":"bottom-handle","targetHandle":null,"id":"reactflow__edge-dndnode_5541bottom-handle-dndnode_0879"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"dndnode_2353","sourceHandle":"b","target":"dndnode_14291","targetHandle":null,"id":"reactflow__edge-dndnode_2353b-dndnode_14291"}],"viewport":{"x":149.50585745683316,"y":-3.760230223415192,"zoom":0.5471282699702094}}',
            surveyEntity.id
        );

        surveyEntity.workflow_id = flowObj.id;
        await surveyRepo.save(surveyEntity);

        const response = await getLiveSurveyNodes(surveyEntity.id);
        expect(response.statusCode).toBe(200);
        expect(response.success).toBe(true);
        expect(response.message).toBe("Survey retrieved");

        expect(response.data.background).toBe(undefined);
        expect(response.data.theme).toBe(undefined);

        const nodes: LiveSurveyNodes[] = response.data.nodes;

        expect(nodes.length).toBe(12);
        nodes.forEach((node, index) => {
            if (index === 0) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(3);
                node.paths.forEach((path, index) => {
                    if (index === 0) {
                        expect(path.condition).toBe('answer contains');
                        expect(path.value).toBe('samad,ninja');
                        expect(path.uId).toBe('dndnode_9145');
                    } else if (index === 1) {
                        expect(path.condition).toBe('answer has any value');
                        expect(path.value).toBe('');
                        expect(path.uId).toBe('dndnode_6167');
                    } else if (index === 2) {
                        expect(path.condition).toBe('default');
                        expect(path.uId).toBe('dndnode_5541');
                    }
                });
            } else if (index === 1) {
                expect(node.isStartingNode).toBe(true);
                expect(node.paths.length).toBe(1);
            } else if (index === 2) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(2);
                node.paths.forEach((path, index) => {
                    if (index === 0) {
                        expect(path.condition).toBe('answer has any value');
                        expect(path.value).toBe('');
                        expect(path.uId).toBe('dndnode_0879');
                    } else if (index === 1) {
                        expect(path.condition).toBe('default');
                        expect(path.uId).toBe('dndnode_1879');
                    }
                });
            } else if (index === 3) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            } else if (index === 4) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(2);
                node.paths.forEach((path, index) => {
                    if (index === 0) {
                        expect(path.condition).toBe('is');
                        expect(path.value).toBe('a');
                        expect(path.uId).toBe('dndnode_1871');
                    } else if (index === 1) {
                        expect(path.condition).toBe('default');
                        expect(path.uId).toBe('dndnode_2121');
                    }
                });
            } else if (index === 5) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(1);
                node.paths.forEach((path) => {
                    expect(path.condition).toBe('default');
                    expect(path.uId).toBe('p-675e7202-087d-4ca3-9c1f-6d8fe2b119de');
                });
            } else if (index === 6) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            } else if (index === 7) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            } else if (index === 8) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            } else if (index === 9) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(2);
                node.paths.forEach((path, index) => {
                    if (index === 0) {
                        expect(path.condition).toBe('is exactly');
                        expect(path.value).toBe('First');
                        expect(path.uId).toBe('p-3c8bfcd1-bbc6-4f0b-99c0-7892fa9c0e47');
                    } else if (index === 1) {
                        expect(path.condition).toBe('default');
                        expect(path.uId).toBe('p-b16c8dc6-6069-4ad1-a3af-f6856bdab99e');
                    }
                });
            } else if (index === 10) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            } else if (index === 11) {
                expect(node.isStartingNode).toBe(false);
                expect(node.paths.length).toBe(0);
            }
        })
    });

})