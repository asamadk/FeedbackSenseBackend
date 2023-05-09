import express from 'express';
import { createFolders, deleteFolder, getFolders } from '../Service/FolderService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/list', async (req : any,res) => {
    try {
        const userEmail = req.user._json.email;
        if(userEmail == null){
            res.status(500).json(getCustomResponse([], 401, 'User not authorized', false));
        }
        const response : responseRest = await getFolders(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
});

router.post('/create/:folderName', async (req : any,res) => {
    try {
        const userEmail = req.user._json.email;
        const foldername : string = req.params.folderName;
        const response = await createFolders(foldername,userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
});

router.delete('/delete/:folderId', async (req,res) => {
    try {
        const folderId = req.params.folderId;
        const response = await deleteFolder(folderId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
})

export default router;