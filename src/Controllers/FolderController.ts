import express from 'express';
import { createFolders, deleteFolder, getFolders } from '../Service/FolderService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';

const router = express.Router();

router.get('/list', async (req : any,res) => {
    try {
        const userEmail = req.user.email;
        if(userEmail == null){
            res.status(500).json(getCustomResponse([], 401, 'User not authorized', false));
        }
        const response : responseRest = await getFolders(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/create/:folderName', async (req : any,res) => {
    try {
        const userEmail = req.user.email;
        const foldername : string = req.params.folderName;
        const response = await createFolders(foldername,userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.delete('/delete/:folderId', async (req,res) => {
    try {
        const folderId = req.params.folderId;
        const response = await deleteFolder(folderId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router;