import express from 'express';
import { createOrganizationForUser, getAllOrgList, pointOrgToUser } from '../Service/OrgService';

const router = express.Router();

router.get('/create/:orgName',async (req : any,res) => {
    const orgName : string = req.params.orgName;
    const response = await createOrganizationForUser(req.user,orgName);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.post('/point',async (req : any ,res) => {
    const payload = req.body;
    const response = await pointOrgToUser(req.user,payload);
    res.statusCode = response.statusCode;
    res.json(response);
})

router.get('/list',async(req,res) => {
    const response = await getAllOrgList();
    res.statusCode = response.statusCode;
    res.json(response);
})

//TODO app org to user endpoint

export default router;