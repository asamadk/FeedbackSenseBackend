import { StartUp } from "../Helpers/Startup";
import { createFolders, deleteFolder, getFolders } from "../Service/FolderService";
import { Folder } from "../Entity/FolderEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Survey } from "../Entity/SurveyEntity";
import { createTestUser } from "./TestUtils.ts/UserTestUtils";
import { SurveyType } from "../Entity/SurveyTypeEntity";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { AppDataSource } from "../Config/AppDataSource";
import { User } from "../Entity/UserEntity";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Fetching Folder test', () => {
    test("Get folders test.", async () => {
        const mockOrgId = '1234';
        const mockFolders = [
            {
                id: '1',
                name: 'Folder 1',
                organization_id: mockOrgId
            },
            {
                id: '2',
                name: 'Folder 2',
                organization_id: mockOrgId
            },
            {
                id: '3',
                name: 'Folder 3',
                organization_id: '5678'
            }
        ];

        const createdUser = await createTestUser(AppDataSource.getDataSource());
        const folderRepo = AppDataSource.getDataSource().getRepository(Folder);
        await folderRepo.save(mockFolders);

        const response = await getFolders(createdUser.email);
        expect(response.data).toHaveLength(2);
        expect(response.message).toBe('Retrieved folders successfully');
        expect(response.statusCode).toBe(200);
        expect(response.success).toBe(true);
    });

    test("Get folders test with invalid orgId.", async () => {
        const userMail = '';
        const response = await getFolders(userMail);
        expect(response.message).toBe('User email is not provided.');
        expect(response.statusCode).toBe(404);
        expect(response.success).toBe(false);
    });

    test("Get specific org folders", async () => {
        const userMail = 'janesmith@example.com';
        const useRepo = AppDataSource.getDataSource().getRepository(User);
        const currentUser = await useRepo.findOne({
            where : {email : userMail}
        });
        currentUser.organization_id = '5678'
        await useRepo.save(currentUser);

        const response = await getFolders(currentUser.email);
        expect(response.data).toHaveLength(1);
        expect(response.message).toBe('Retrieved folders successfully');
        expect(response.statusCode).toBe(200);
        expect(response.success).toBe(true);
    });
});

describe('Create Folder test', () => {
    test('Create folder test', async () => {
        const folderName = 'Test Folder';
        const userMail = 'janesmith@example.com';
        const response = await createFolders(folderName, userMail);
        expect(response.success).toBe(true);
        expect(response.message).toBe(`Folder ${folderName} created successfully`);
        expect(response.data.name).toBe(folderName);
        expect(response.data.organization_id).toBe('5678');
    });

    test('Missing folder name', async () => {
        const folderName = '';
        const userMail = 'janesmith@example.com';
        const response = await createFolders(folderName, userMail);
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(404);
        expect(response.message).toBe('Folder name is not present');
        expect(response.data).toEqual([]);
    });

    test('Missing user email', async () => {
        const folderName = 'Test Folder';
        const userMail = '';

        const response = await createFolders(folderName, userMail);

        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(500);
        expect(response.message).toBe('User email not provided');
        expect(response.data).toEqual(null);
    });
});


describe('deleteFolder', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return an error response if folderId is not provided', async () => {
        const expectedResponse = getCustomResponse([], 404, 'Folder is not present', false);

        const response = await deleteFolder('');

        expect(response).toEqual(expectedResponse);
    });

    it('should delete folder and remove folder_id from surveys in folder', async () => {

        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);
        const folderRepo = AppDataSource.getDataSource().getRepository(Folder);
        const surveyTypeRepo = AppDataSource.getDataSource().getRepository(SurveyType);

        const tempUser = await createTestUser(AppDataSource.getDataSource());
        const mockFolder = await folderRepo.findOne({
            where : {
                name : 'Test Folder'
            }
        });

        const surveyTypeObj = await surveyTypeRepo.findOneBy({
            label : 'Email or link Survey'
        })
        
        const mockFolderId = mockFolder.id;

        const mockSurvey = new Survey();
        mockSurvey.id = 'mockSurveyId';
        mockSurvey.folder_id = mockFolderId;
        mockSurvey.user_id = tempUser.id;
        mockSurvey.name = 'New survey - ' + new Date().toDateString();
        mockSurvey.survey_type_id = surveyTypeObj.id;

        const surveyId = (await surveyRepo.save(mockSurvey)).id;
        const expectedResponse = getDefaultResponse('Folder deleted successfully');        
        const response = await deleteFolder(mockFolderId);

        const updatedSurvey = await surveyRepo.findOneBy({
            id : surveyId
        });

        expect(updatedSurvey.folder_id).toBe(null);
        expect(response).toEqual(expectedResponse);
    });
});