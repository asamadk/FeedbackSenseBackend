import express from 'express';
import { createFolders, deleteFolder, getFolders } from '../Service/FolderService';
import { responseRest } from '../Types/ApiTypes';

const router = express.Router();

router.get('/list/:orgId', async (req,res) => {
    const orgId : string = req.params.orgId;
    const response : responseRest = await getFolders(orgId);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.post('/create/:orgId/:folderName', async (req,res) => {
    const orgId : string = req.params.orgId;
    const foldername : string = req.params.folderName;
    const response = await createFolders(foldername,orgId);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.delete('/delete/:folderId', async (req,res) => {
    const folderId = req.params.folderId;
    const response = await deleteFolder(folderId);
    res.statusCode = response.statusCode;
    res.json(response);
})

export default router;