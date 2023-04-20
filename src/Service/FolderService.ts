import { responseRest } from "../Types/ApiTypes";
import { getDataSource } from '../Config/AppDataSource';
import { Folder } from "../Entity/FolderEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Survey } from "../Entity/SurveyEntity";


export const getFolders = async (orgId : string) : Promise<responseRest> => {
    const response = getDefaultResponse('Retrieved folders successfully');
    const folderRepository = getDataSource(false).getRepository(Folder);

    if(orgId == null || orgId == ''){
        return getCustomResponse([],404,'Organization id is not present',false);
    }

    const folderList = await folderRepository.findBy({
        organization_id : orgId
    });

    response.data = folderList;
    return response;
}

export const createFolders = async (folderName : string , orgId : string) : Promise<responseRest> => {
    const response = getDefaultResponse(`Folder ${folderName} created successfully`);
    const folderRepository = getDataSource(false).getRepository(Folder);

    if(folderName == null || folderName == ''){
        return getCustomResponse([],404,'Folder name is not present',false);
    }

    if(orgId == null || orgId == ''){
        return getCustomResponse([],404,'Organization id is not present',false);
    }

    const folderObj = new Folder();
    folderObj.name = folderName;
    folderObj.organization_id = orgId;

    await folderRepository.save(folderObj);
    response.data = folderObj;
    return response;
}

export const deleteFolder = async (folderId : string) : Promise<responseRest> => {
    const response = getDefaultResponse(`Folder deleted successfully`);
    try {
        if(folderId == null || folderId == ''){
            return getCustomResponse([],404,'Folder is not present',false);
        }
        const folderRepository = getDataSource(false).getRepository(Folder);
        const surveyRepo = getDataSource(false).getRepository(Survey);
        const surveyList = await surveyRepo.findBy({
            folder_id : folderId
        });
    
        if(surveyList != null){
            surveyList.map(survey => {
                survey.folder_id = null;
            });
        }
        await surveyRepo.save(surveyList);
        await folderRepository.delete({
            id : folderId
        });
    } catch (error) {
        console.log('Exception :: deleteFolder :: ', error);
    }
    return response;
}