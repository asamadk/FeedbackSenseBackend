import express from 'express';
import { createFolders, deleteFolder, getFolders } from '../Service/FolderService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/list/:orgId', async (req,res) => {
    try {
        const orgId : string = req.params.orgId;
        const response : responseRest = await getFolders(orgId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
});

router.post('/create/:orgId/:folderName', async (req,res) => {
    try {
        const orgId : string = req.params.orgId;
        const foldername : string = req.params.folderName;
        const response = await createFolders(foldername,orgId);
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