import { DataSource } from "typeorm";
import { Survey } from "../../Entity/SurveyEntity";
import { createTestUser } from "./UserTestUtils";
import { SurveyType } from "../../Entity/SurveyTypeEntity";
import { createFolders } from "../../Service/FolderService";
import { Workflow } from "../../Entity/WorkflowEntity";

export const createTestSurvey = async(connection : DataSource) : Promise<Survey> => {
    const surveyTypeRepo = connection.getRepository(SurveyType);
    const surveyRepo = connection.getRepository(Survey);
    const { data } = await createFolders('TEMP_FOLDER', '1234');

    const surveyTypeObj = await surveyTypeRepo.findOneBy({
        label : 'Email or link Survey'
    })

    const tempUser = await createTestUser(connection);
    const mockSurvey = new Survey();
    mockSurvey.folder_id = data.id;
    mockSurvey.user_id = tempUser.id;
    mockSurvey.name = 'New survey - ' + new Date().toDateString();
    mockSurvey.survey_type_id = surveyTypeObj.id;

    return await surveyRepo.save(mockSurvey);
}

export const createSurveyFlow = async(connection : DataSource, surveyId : string) : Promise<void> => {
    const surveyFlow = new Workflow();
    surveyFlow.json = '{"nodes":[{"width":300,"height":82,"id":"dndnode_363","type":"selectorNode","data":{"uId":"dndnode_363","compId":1,"label":"Welcome message","description":"Take a moment to introduce the purpose of your survey or say hi to your audience.","compConfig":"{\\"welcomeText\\":\\"Welcome to FeedbackSense\\",\\"buttonText\\":\\"Next\\"}"},"style":{"color":"#00B3EC","border":"1px #00B3EC solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":411,"y":105.5},"selected":false,"positionAbsolute":{"x":411,"y":105.5},"dragging":false},{"width":300,"height":82,"id":"dndnode_4383","type":"selectorNode","data":{"uId":"dndnode_4383","compId":6,"label":"Smiley scale","description":"Ask people to rate something on a visual smiley scale. .","compConfig":"{\\"question\\":\\"How are you feeling right now ?\\",\\"leftText\\":\\"Very Bad\\",\\"rightText\\":\\"Good\\"}"},"style":{"color":"#EA8FEA","border":"1px #EA8FEA solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":414,"y":275.5},"selected":false,"dragging":false,"positionAbsolute":{"x":414,"y":275.5}},{"width":300,"height":82,"id":"dndnode_52","type":"selectorNode","data":{"uId":"dndnode_52","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"You f****d you\\",\\"answerList\\":[\\"Yes\\",\\"No\\"],\\"type\\":\\"single\\"}"},"style":{"color":"#9E4784","border":"1px #9E4784 solid","width":"300px","height":"82px","backgroundColor":"#1E1E1E","borderRadius":"5px","padding":"10px"},"position":{"x":412,"y":495.5},"selected":true,"dragging":false,"positionAbsolute":{"x":412,"y":495.5}}],"edges":[{"source":"dndnode_363","sourceHandle":"b","target":"dndnode_4383","targetHandle":null,"id":"reactflow__edge-dndnode_363b-dndnode_4383"},{"source":"dndnode_4383","sourceHandle":"b","target":"dndnode_52","targetHandle":null,"id":"reactflow__edge-dndnode_4383b-dndnode_52"}],"viewport":{"x":15,"y":-32,"zoom":1}}';
    surveyFlow.surveyId = surveyId;
    await connection.getRepository(Workflow).save(surveyFlow);
}