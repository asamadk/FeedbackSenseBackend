import { DataSource } from "typeorm";
import { Survey } from "../../Entity/SurveyEntity";
import { createTestUser } from "./UserTestUtils";
import { SurveyType } from "../../Entity/SurveyTypeEntity";
import { createFolders } from "../../Service/FolderService";

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