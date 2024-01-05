import { AppDataSource } from "../Config/AppDataSource";
import { FilterHelper } from "../Helpers/FilterHelper";
import { StartUp } from "../Helpers/Startup";
import { WorkflowParser } from "../Helpers/WorkflowParser";
import { FilterPayloadType } from "../Types/SurveyTypes";
import { TestHelper } from "./TestUtils.ts/TestHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Get filter data from survey', () => {

    test('Provide an empty JSON string as input', async () => {
        const result = FilterHelper.getFilterDataFromSurvey('');
        expect(result.length).toBe(0);
    });

    test('Valid survey JSON with multiple filterable components', async () => {
        const surveyJSON = '{"nodes":[{"width":300,"height":82,"id":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","type":"selectorNode","data":{"uId":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Thank you for your kind visit to OM Sweets. We hope that you had a Great Experience with us.\\\\n\\",\\"buttonText\\":\\"Start\\",\\"existing\\":false}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":426.981312,"y":1.3784320000000037},"selected":false,"positionAbsolute":{"x":426.981312,"y":1.3784320000000037},"dragging":false},{"width":300,"height":82,"id":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","type":"selectorNode","data":{"uId":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Which of our restaurant chains did you visit today?\\",\\"answerList\\":[\\"Chain 1\\",\\"Chain 2\\",\\"Chain 3\\",\\"Chain 4\\",\\"Chain 5\\",\\"Chain 6\\",\\"Chain 7\\",\\"Chain 8\\",\\"Chain 9\\",\\"Chain 10\\",\\"Chain 11\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":426.99065600000006,"y":121.17706506666673},"selected":false,"positionAbsolute":{"x":426.99065600000006,"y":121.17706506666673},"dragging":false},{"width":300,"height":82,"id":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","type":"selectorNode","data":{"uId":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Feedback Type\\",\\"answerList\\":[\\"Complement\\",\\"Enquiry\\",\\"Feedback\\",\\"Complaint\\"],\\"type\\":\\"single\\",\\"logic\\":[{\\"id\\":\\"9e2de473-d7c3-4428-8794-e292439c9498\\",\\"operator\\":\\"is\\",\\"path\\":\\"enquiry-complaint\\",\\"value\\":\\"Enquiry\\",\\"showValue\\":true},{\\"id\\":\\"952c2976-90ce-43d4-ab8f-65684cd6f3fc\\",\\"operator\\":\\"is\\",\\"path\\":\\"enquiry-complaint\\",\\"value\\":\\"Complaint\\",\\"showValue\\":true}],\\"existing\\":false}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":427.09807215238095,"y":243.56006944761907},"selected":false,"positionAbsolute":{"x":427.09807215238095,"y":243.56006944761907},"dragging":false},{"width":300,"height":82,"id":"p-e844b750-1006-44da-aed8-295d2c9d1801","type":"selectorNode","data":{"uId":"p-e844b750-1006-44da-aed8-295d2c9d1801","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"Please write your Feedback\\",\\"logic\\":[],\\"required\\":false,\\"existing\\":false}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":400.53211904663164,"y":553.6085582186666},"selected":false,"positionAbsolute":{"x":400.53211904663164,"y":553.6085582186666},"dragging":false},{"width":300,"height":82,"id":"p-70063df2-38c9-416a-a732-814faada072d","type":"selectorNode","data":{"uId":"p-70063df2-38c9-416a-a732-814faada072d","compId":7,"label":"Rating scale","description":"Ask people to rate something. Great for measuring satisfaction. ","compConfig":"{\\"question\\":\\"Please Rate your experience from 1 to 5 - where 1 is low and 5 is high\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"range\\":5,\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#E9967A","border":"1px #E9967A solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":641.7660668180603,"y":416.1742252281904},"selected":false,"positionAbsolute":{"x":641.7660668180603,"y":416.1742252281904},"dragging":false},{"width":300,"height":82,"id":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","type":"selectorNode","data":{"uId":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","compId":11,"label":"Contact form","description":"Collect contact information such as name, email, then create contacts in your CRM if .","compConfig":"{\\"question\\":\\"Please help us with your contact details\\",\\"answerList\\":[\\"Name\\",\\"Phone\\"],\\"existing\\":false}"},"style":{"color":"#0F6292","border":"1px #0F6292 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":402.16285344761906,"y":696.8965467428569},"selected":true,"positionAbsolute":{"x":402.16285344761906,"y":696.8965467428569},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","sourceHandle":"bottom-handle","target":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","targetHandle":"top-handle","id":"reactflow__edge-p-49680bf6-8470-494e-99bd-79a0a1505c7ebottom-handle-p-c68a471a-d110-4ac7-9268-8e42dda294c1top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","sourceHandle":"bottom-handle","target":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","targetHandle":"top-handle","id":"reactflow__edge-p-c68a471a-d110-4ac7-9268-8e42dda294c1bottom-handle-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","target":"p-e844b750-1006-44da-aed8-295d2c9d1801","label":"enquiry-complaint","id":"reactflow__edge-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19bottom-handle-p-e844b750-1006-44da-aed8-295d2c9d1801top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","target":"p-70063df2-38c9-416a-a732-814faada072d","label":"default","id":"reactflow__edge-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19bottom-handle-p-70063df2-38c9-416a-a732-814faada072dtop-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-70063df2-38c9-416a-a732-814faada072d","sourceHandle":"bottom-handle","target":"p-e844b750-1006-44da-aed8-295d2c9d1801","targetHandle":"top-handle","id":"reactflow__edge-p-70063df2-38c9-416a-a732-814faada072dbottom-handle-p-e844b750-1006-44da-aed8-295d2c9d1801top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-e844b750-1006-44da-aed8-295d2c9d1801","sourceHandle":"bottom-handle","target":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","targetHandle":"top-handle","id":"reactflow__edge-p-e844b750-1006-44da-aed8-295d2c9d1801bottom-handle-p-77624f1a-deb6-40ad-8f43-06d5052d4a51top-handle"}],"viewport":{"x":76.20015474546818,"y":27.684820471038563,"zoom":0.6903083832391232}}';
        const result = FilterHelper.getFilterDataFromSurvey(surveyJSON);
        expect(result.length).toBe(3);
        expect(result[0].questionType === 'choice');
        for (let i = 1; i <= 11; i++) {
            expect(result[0].answers.includes(`Chain ${i}`));
        }
        expect(result[0].operators[0]).toBe('equals');
        expect(result[0].operators[1]).toBe('does not equals');

        expect(result[1].questionType === 'choice');
        expect(result[1].answers[0]).toBe('Complement');
        expect(result[1].answers[1]).toBe('Enquiry');
        expect(result[1].answers[2]).toBe('Feedback');
        expect(result[1].answers[3]).toBe('Complaint');
        expect(result[1].operators[0]).toBe('equals');
        expect(result[1].operators[1]).toBe('does not equals');

        expect(result[2].questionType === 'rating');
        expect(result[2].operators[0]).toBe('is');
        expect(result[2].operators[1]).toBe('is not');
        for (let i = 0; i < 5; i++) {
            expect(result[2].answers[i]).toBe(i + 1);
        }
    });

});

describe('Get number array', () => {

    test('Provide n as 5', () => {
        const res = FilterHelper.generateNumberArray(5);
        for (let i = 0; i < 5; i++) {
            expect(res[i]).toBe(i + 1);
        }
    });

    test('Provide n as 0', () => {
        const res = FilterHelper.generateNumberArray(0);
        expect(res.length).toBe(0);
    });

    test('Provide n as negative 3', () => {
        const res = FilterHelper.generateNumberArray(-3);
        expect(res.length).toBe(0);
    });

});

describe('Get filterable component', () => {

    test('Empty component list', () => {
        const res = FilterHelper.getFilterableComponent([]);
        expect(res.length).toBe(0);
    });

    test('Mix of filterable & non-filterable component list', () => {
        const surveyJSON = '{"nodes":[{"width":300,"height":82,"id":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","type":"selectorNode","data":{"uId":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Thank you for your kind visit to OM Sweets. We hope that you had a Great Experience with us.\\\\n\\",\\"buttonText\\":\\"Start\\",\\"existing\\":false}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":426.981312,"y":1.3784320000000037},"selected":false,"positionAbsolute":{"x":426.981312,"y":1.3784320000000037},"dragging":false},{"width":300,"height":82,"id":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","type":"selectorNode","data":{"uId":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Which of our restaurant chains did you visit today?\\",\\"answerList\\":[\\"Chain 1\\",\\"Chain 2\\",\\"Chain 3\\",\\"Chain 4\\",\\"Chain 5\\",\\"Chain 6\\",\\"Chain 7\\",\\"Chain 8\\",\\"Chain 9\\",\\"Chain 10\\",\\"Chain 11\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":426.99065600000006,"y":121.17706506666673},"selected":false,"positionAbsolute":{"x":426.99065600000006,"y":121.17706506666673},"dragging":false},{"width":300,"height":82,"id":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","type":"selectorNode","data":{"uId":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Feedback Type\\",\\"answerList\\":[\\"Complement\\",\\"Enquiry\\",\\"Feedback\\",\\"Complaint\\"],\\"type\\":\\"single\\",\\"logic\\":[{\\"id\\":\\"9e2de473-d7c3-4428-8794-e292439c9498\\",\\"operator\\":\\"is\\",\\"path\\":\\"enquiry-complaint\\",\\"value\\":\\"Enquiry\\",\\"showValue\\":true},{\\"id\\":\\"952c2976-90ce-43d4-ab8f-65684cd6f3fc\\",\\"operator\\":\\"is\\",\\"path\\":\\"enquiry-complaint\\",\\"value\\":\\"Complaint\\",\\"showValue\\":true}],\\"existing\\":false}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":427.09807215238095,"y":243.56006944761907},"selected":false,"positionAbsolute":{"x":427.09807215238095,"y":243.56006944761907},"dragging":false},{"width":300,"height":82,"id":"p-e844b750-1006-44da-aed8-295d2c9d1801","type":"selectorNode","data":{"uId":"p-e844b750-1006-44da-aed8-295d2c9d1801","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"Please write your Feedback\\",\\"logic\\":[],\\"required\\":false,\\"existing\\":false}"},"style":{"color":"#539165","border":"1px #539165 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":400.53211904663164,"y":553.6085582186666},"selected":false,"positionAbsolute":{"x":400.53211904663164,"y":553.6085582186666},"dragging":false},{"width":300,"height":82,"id":"p-70063df2-38c9-416a-a732-814faada072d","type":"selectorNode","data":{"uId":"p-70063df2-38c9-416a-a732-814faada072d","compId":7,"label":"Rating scale","description":"Ask people to rate something. Great for measuring satisfaction. ","compConfig":"{\\"question\\":\\"Please Rate your experience from 1 to 5 - where 1 is low and 5 is high\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"range\\":5,\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#E9967A","border":"1px #E9967A solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":641.7660668180603,"y":416.1742252281904},"selected":false,"positionAbsolute":{"x":641.7660668180603,"y":416.1742252281904},"dragging":false},{"width":300,"height":82,"id":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","type":"selectorNode","data":{"uId":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","compId":11,"label":"Contact form","description":"Collect contact information such as name, email, then create contacts in your CRM if .","compConfig":"{\\"question\\":\\"Please help us with your contact details\\",\\"answerList\\":[\\"Name\\",\\"Phone\\"],\\"existing\\":false}"},"style":{"color":"#0F6292","border":"1px #0F6292 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":402.16285344761906,"y":696.8965467428569},"selected":true,"positionAbsolute":{"x":402.16285344761906,"y":696.8965467428569},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-49680bf6-8470-494e-99bd-79a0a1505c7e","sourceHandle":"bottom-handle","target":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","targetHandle":"top-handle","id":"reactflow__edge-p-49680bf6-8470-494e-99bd-79a0a1505c7ebottom-handle-p-c68a471a-d110-4ac7-9268-8e42dda294c1top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-c68a471a-d110-4ac7-9268-8e42dda294c1","sourceHandle":"bottom-handle","target":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","targetHandle":"top-handle","id":"reactflow__edge-p-c68a471a-d110-4ac7-9268-8e42dda294c1bottom-handle-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","target":"p-e844b750-1006-44da-aed8-295d2c9d1801","label":"enquiry-complaint","id":"reactflow__edge-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19bottom-handle-p-e844b750-1006-44da-aed8-295d2c9d1801top-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19","target":"p-70063df2-38c9-416a-a732-814faada072d","label":"default","id":"reactflow__edge-p-1e2ebdb0-a751-4b8b-8633-d68c2b2e5e19bottom-handle-p-70063df2-38c9-416a-a732-814faada072dtop-handle","sourceHandle":"bottom-handle","targetHandle":"top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-70063df2-38c9-416a-a732-814faada072d","sourceHandle":"bottom-handle","target":"p-e844b750-1006-44da-aed8-295d2c9d1801","targetHandle":"top-handle","id":"reactflow__edge-p-70063df2-38c9-416a-a732-814faada072dbottom-handle-p-e844b750-1006-44da-aed8-295d2c9d1801top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-e844b750-1006-44da-aed8-295d2c9d1801","sourceHandle":"bottom-handle","target":"p-77624f1a-deb6-40ad-8f43-06d5052d4a51","targetHandle":"top-handle","id":"reactflow__edge-p-e844b750-1006-44da-aed8-295d2c9d1801bottom-handle-p-77624f1a-deb6-40ad-8f43-06d5052d4a51top-handle"}],"viewport":{"x":76.20015474546818,"y":27.684820471038563,"zoom":0.6903083832391232}}';
        const workflowParser = new WorkflowParser(surveyJSON);
        const res = FilterHelper.getFilterableComponent(workflowParser.getCleanComponentData());
        expect(res.length).toBe(3);
    });

    test('All filterable component list', () => {
        const surveyJSON = '{"nodes":[{"width":300,"height":82,"id":"p-2e378de2-6a2c-45ae-8a25-746d80169dc5","type":"selectorNode","data":{"uId":"p-2e378de2-6a2c-45ae-8a25-746d80169dc5","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Choose\\",\\"answerList\\":[\\"Answer 1\\",\\"Answer 2\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":427,"y":64},"selected":false,"positionAbsolute":{"x":427,"y":64},"dragging":false},{"width":300,"height":82,"id":"p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4","type":"selectorNode","data":{"uId":"p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4","compId":4,"label":"Multiple answer selection","description":"Let people choose multiple answers from a list. Use it when more than one answer applies.","compConfig":"{\\"question\\":\\"Choose many\\",\\"answerList\\":[\\"Answer 1\\",\\"Answer 2\\"],\\"type\\":\\"multiple\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#F26419","border":"1px #F26419 solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":427,"y":180},"selected":false,"positionAbsolute":{"x":427,"y":180},"dragging":false},{"width":300,"height":82,"id":"p-b6cc1202-3a68-4237-8469-714689cfab82","type":"selectorNode","data":{"uId":"p-b6cc1202-3a68-4237-8469-714689cfab82","compId":6,"label":"Smiley scale","description":"Ask people to rate something on a visual smiley scale. .","compConfig":"{\\"question\\":\\"Smile\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#EA8FEA","border":"1px #EA8FEA solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":426,"y":299},"selected":false,"positionAbsolute":{"x":426,"y":299},"dragging":false},{"width":300,"height":82,"id":"p-d66c0b2a-8eee-40de-bd2b-40c76491e7da","type":"selectorNode","data":{"uId":"p-d66c0b2a-8eee-40de-bd2b-40c76491e7da","compId":7,"label":"Rating scale","description":"Ask people to rate something. Great for measuring satisfaction. ","compConfig":"{\\"question\\":\\"Rate\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"range\\":7,\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#E9967A","border":"1px #E9967A solid","width":"300px","height":"82px","borderRadius":"5px","padding":"10px","backgroundColor":"#081213"},"position":{"x":428,"y":419},"selected":true,"positionAbsolute":{"x":428,"y":419},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-2e378de2-6a2c-45ae-8a25-746d80169dc5","sourceHandle":"bottom-handle","target":"p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4","targetHandle":"top-handle","id":"reactflow__edge-p-2e378de2-6a2c-45ae-8a25-746d80169dc5bottom-handle-p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4","sourceHandle":"bottom-handle","target":"p-b6cc1202-3a68-4237-8469-714689cfab82","targetHandle":"top-handle","id":"reactflow__edge-p-23e5ebb6-40e0-4c2c-9560-a84b65dff6d4bottom-handle-p-b6cc1202-3a68-4237-8469-714689cfab82top-handle"},{"type":"straight","labelStyle":{"color":"#006dff","fill":"#006dff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#f1f1f1","background":"#ffcc00"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#f1f1f1"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#f1f1f1"},"source":"p-b6cc1202-3a68-4237-8469-714689cfab82","sourceHandle":"bottom-handle","target":"p-d66c0b2a-8eee-40de-bd2b-40c76491e7da","targetHandle":"top-handle","id":"reactflow__edge-p-b6cc1202-3a68-4237-8469-714689cfab82bottom-handle-p-d66c0b2a-8eee-40de-bd2b-40c76491e7datop-handle"}],"viewport":{"x":0,"y":0,"zoom":1}}';
        const workflowParser = new WorkflowParser(surveyJSON);
        const res = FilterHelper.getFilterableComponent(workflowParser.getCleanComponentData());
        expect(res.length).toBe(4);
    });

});

describe('Does response satisfies condition', () => {

    test('Empty filter payload array', () => {
        const res = FilterHelper.doesResponseSatisfiesCondition([], []);
        expect(res).toBe(true);
    });

    test('Question id does not exists in response', () => {
        try {
            FilterHelper.doesResponseSatisfiesCondition([], [
                {
                    id: '1',
                    questionId: 'nonExistentQuestionId',
                    question: 'Sample Question',
                    operator: 'equals',
                    value: 'Sample Value',
                    logicOperator: 'and',
                }
            ]);
        } catch (error) {
            expect(error.message).toBe('Something went wrong, Please contact support.');
        }
    });

    test('Filter payload matches response', () => {
        const response: any[] = [
            {
                uiId: 'question1',
                id: 3,
                data: { selectedVal: 'Sample Value' }, // Matched response for question1
            },
            {
                uiId: 'question2',
                id: 3,
                data: { selectedVal: 'Another Value' },
            },
        ];

        const filterPayload: FilterPayloadType[] = [
            {
                id: '1',
                questionId: 'question1',
                question: 'Sample Question',
                operator: 'equals',
                value: 'Sample Value',
                logicOperator: 'and',
            },
        ];
        const res = FilterHelper.doesResponseSatisfiesCondition(response, filterPayload);
        expect(res).toBe(true);
    });

    test('Filter payload does not match the response', async () => {
        const response: any[] = [
            {
                uiId: 'question1',
                id: 3,
                data: { selectedVal: 'Sample Value' }, // Matched response for question1
            },
            {
                uiId: 'question2',
                id: 3,
                data: { selectedVal: 'Another Value' },
            },
        ];

        const filterPayload: FilterPayloadType[] = [
            {
                id: '1',
                questionId: 'question1',
                question: 'Sample Question',
                operator: 'equals',
                value: 'Different Value',
                logicOperator: 'and',
            },
        ];
        const res = FilterHelper.doesResponseSatisfiesCondition(response, filterPayload);
        expect(res).toBe(false);
    });

    test('Filter payload with multiple conditions using "and" ', async () => {
        const response: any[] = [
            {
                uiId: 'question1',
                id: 3,
                data: { selectedVal: 'Sample Value' }, // Matched response for question1
            },
            {
                uiId: 'question2',
                id: 3,
                data: { selectedVal: 'Another Value' },
            },
            {
                uiId: 'question3',
                id: 3,
                data: { selectedVal: 'Third Value' }, // Matched response for question3
            },
        ];

        const filterPayload: FilterPayloadType[] = [
            {
                id: '1',
                questionId: 'question1', // Matched with uiId from response
                question: 'Sample Question 1',
                operator: 'equals',
                value: 'Sample Value', // Matching value
                logicOperator: 'and',
            },
            {
                id: '2',
                questionId: 'question3', // Matched with uiId from response
                question: 'Sample Question 3',
                operator: 'equals',
                value: 'Third Value', // Matching value
                logicOperator: 'and',
            },
        ];

        const res = FilterHelper.doesResponseSatisfiesCondition(response, filterPayload);
        expect(res).toBe(true);
    });

    test('Filter payload with multiple conditions using "or" logic operator', async () => {
        const response: any[] = [
            {
                uiId: 'question1',
                id: 3,
                data: { selectedVal: 'Sample Value 1' }, // Matched response for question1
            },
            {
                uiId: 'question2',
                id: 3,
                data: { selectedVal: 'Another Value' },
            },
            {
                uiId: 'question3',
                id: 3,
                data: { selectedVal: 'Third Value' }, // Matched response for question3
            },
        ];

        const filterPayload: FilterPayloadType[] = [
            {
                id: '1',
                questionId: 'question1', // Matched with uiId from response
                question: 'Sample Question 1',
                operator: 'equals',
                value: 'Invalid Value', // Not matching value for this condition
                logicOperator: 'or',
            },
            {
                id: '2',
                questionId: 'question3', // Matched with uiId from response
                question: 'Sample Question 3',
                operator: 'equals',
                value: 'Third Value', // Matching value for this condition
                logicOperator: 'or',
            },
        ];

        const res = FilterHelper.doesResponseSatisfiesCondition(response, filterPayload);
        expect(res).toBe(true);

    });
});

describe('Test match question', () => {

    test('Match a "choice" type question with an "equals" operator where the answer matches', () => {
        const payload: FilterPayloadType = {
            id: "3",
            questionId: "p-800c1401-7a85-4e39-8f70-b61c066c724e",
            question: "How do you feel about our new product?",
            operator: "equals",
            value: "fotty seven",
            logicOperator: "and",
        };

        const response: any = {
            id: 3,
            data: {
                type: "single",
                selectedVal: "fotty seven",
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });

    test('Match a "choice" type question with a "does not equal" operator where the answer doesn\'t match. Expect true as the result.', () => {
        const payload: FilterPayloadType = {
            id: "3",
            questionId: "p-800c1401-7a85-4e39-8f70-b61c066c724e",
            question: "How do you feel about our new product?",
            operator: "does not equals",
            value: "Some Other Answer",
            logicOperator: "and",
        };

        const response: any = {
            id: 3,
            data: {
                type: "single",
                selectedVal: "fotty seven",
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });

    test('Match a "rating" type question with an "is" operator where the rating matches. Expect true as the result.', () => {
        const payload: FilterPayloadType = {
            id: "7",
            questionId: "p-e65b4eef-998d-48ea-8a65-bf33de53a7bc",
            question: "Rate ?",
            operator: "is",
            value: "6",
            logicOperator: "and",
        };

        const response: any = {
            id: 7,
            data: {
                value: 6,
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });

    test('Match a "rating" type question with an "is not" operator where the rating doesn\'t match. Expect true as the result.', () => {
        const payload: FilterPayloadType = {
            id: "7",
            questionId: "p-e65b4eef-998d-48ea-8a65-bf33de53a7bc",
            question: "Rate ?",
            operator: "is not",
            value: "4",
            logicOperator: "and",
        };

        const response: any = {
            id: 7,
            data: {
                value: 6,
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });

    test('Match a "smiley" type question with an "equals" operator where the emoji matches. Expect true as the result.', () => {
        const payload: FilterPayloadType = {
            id: "6",
            questionId: "p-4c8cf7de-18bb-416f-8a52-67b7b1daf83f",
            question: "How many ?",
            operator: "equals",
            value: "Neutral",
            logicOperator: "and",
        };

        const response: any = {
            id: 6,
            data: {
                emojiId: "2",
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });

    test('Match a "smiley" type question with a "does not equal" operator where the emoji doesn\'t match. Expect true as the result.', () => {
        const payload: FilterPayloadType = {
            id: "6",
            questionId: "p-4c8cf7de-18bb-416f-8a52-67b7b1daf83f",
            question: "How many ?",
            operator: "does not equals",
            value: "Neutral",
            logicOperator: "and",
        };

        const response: any = {
            id: 6,
            data: {
                emojiId: "3",
                surveyCompleted: false,
            },
        };

        const result = FilterHelper.matchQuestion(payload, response);
        expect(result).toBe(true);
    });
});

describe('Test Apply filter logic', () => {

    test('Provide a filterPayload and booleanResults array with "and" logic operator', () => {
        const filterPayload: FilterPayloadType[] = [
            { id: "1", questionId: "q1", question: "Question 1", operator: "equals", value: "A", logicOperator: "and" },
            { id: "2", questionId: "q2", question: "Question 2", operator: "equals", value: "B", logicOperator: "and" },
        ];

        const booleanResults: boolean[] = [
            true,
            true,
        ];

        const result = FilterHelper.applyFilterLogic(filterPayload, booleanResults);
        expect(result).toBe(true);
    });

    test('Provide a filterPayload and booleanResults array with "or" logic operator.', () => {
        const filterPayload: FilterPayloadType[] = [
            { id: "1", questionId: "q1", question: "Question 1", operator: "equals", value: "A", logicOperator: "or" },
            { id: "2", questionId: "q2", question: "Question 2", operator: "equals", value: "B", logicOperator: "or" },
        ];

        const booleanResults: boolean[] = [
            false,
            true,
        ];

        const result = FilterHelper.applyFilterLogic(filterPayload, booleanResults);
        expect(result).toBe(true);
    });

    test('Provide a filterPayload and booleanResult array with "and" and both values as false',() => {
        const filterPayload: FilterPayloadType[] = [
            { id: "1", questionId: "q1", question: "Question 1", operator: "equals", value: "A", logicOperator: "and" },
            { id: "2", questionId: "q2", question: "Question 2", operator: "equals", value: "B", logicOperator: "and" },
        ];

        const booleanResults: boolean[] = [
            false,
            false,
        ];

        const result = FilterHelper.applyFilterLogic(filterPayload, booleanResults);
        expect(result).toBe(false);
    });

    test('Provide a filterPayload and booleanResult array with "and" and one value as false',() => {
        const filterPayload: FilterPayloadType[] = [
            { id: "1", questionId: "q1", question: "Question 1", operator: "equals", value: "A", logicOperator: "and" },
            { id: "2", questionId: "q2", question: "Question 2", operator: "equals", value: "B", logicOperator: "and" },
            { id: "3", questionId: "q2", question: "Question 2", operator: "equals", value: "B", logicOperator: "and" },
        ];

        const booleanResults: boolean[] = [
            false,
            false,
            true
        ];

        const result = FilterHelper.applyFilterLogic(filterPayload, booleanResults);
        expect(result).toBe(false);
    });

});