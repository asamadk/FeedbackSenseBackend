import { responseRest } from "../Types/ApiTypes";
import { getDataSource } from '../Config/AppDataSource';
import { Folder } from "../Entity/FolderEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Survey } from "../Entity/SurveyEntity";
import { User } from "../Entity/UserEntity";
import { logger } from "../Config/LoggerConfig";


export const getFolders = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Retrieved folders successfully');
        const folderRepository = getDataSource(false).getRepository(Folder);
        const userRepo = getDataSource(false).getRepository(User);

        const user = await userRepo.findOneBy({
            email: userEmail
        });

        if (user == null || user.organization_id == null) {
            return getCustomResponse(null, 401, 'User not found', false);
        }

        const folderList = await folderRepository.findBy({
            organization_id: user.organization_id
        });

        response.data = folderList;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const createFolders = async (folderName: string, userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse(`Folder ${folderName} created successfully`);
        const folderRepository = getDataSource(false).getRepository(Folder);
        const userRepo = getDataSource(false).getRepository(User);

        const user = await userRepo.findOneBy({
            email: userEmail
        });

        if (user == null || user.organization_id == null) {
            return getCustomResponse(null, 401, 'User not found', false);
        }

        if (folderName == null || folderName == '') {
            return getCustomResponse([], 404, 'Folder name is not present', false);
        }

        const duplicateFolder = await folderRepository.findOne({
            where : {
                name : folderName
            }
        });

        if(duplicateFolder != null){
            return getCustomResponse([], 409, 'Folder already exists', false);
        }

        const folderObj = new Folder();
        folderObj.name = folderName;
        folderObj.organization_id = user.organization_id;

        await folderRepository.save(folderObj);
        response.data = folderObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteFolder = async (folderId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse(`Folder deleted successfully`);
        if (folderId == null || folderId == '') {
            return getCustomResponse([], 404, 'Folder is not present', false);
        }
        const folderRepository = getDataSource(false).getRepository(Folder);
        const surveyRepo = getDataSource(false).getRepository(Survey);
        const surveyList = await surveyRepo.findBy({
            folder_id: folderId
        });

        if (surveyList != null) {
            surveyList.map(survey => {
                survey.folder_id = null;
            });
        }
        await surveyRepo.save(surveyList);
        await folderRepository.delete({
            id: folderId
        });
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}