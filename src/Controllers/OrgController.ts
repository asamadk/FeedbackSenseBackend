import express from 'express';
import { createOrganizationForUser, getAllOrgList, pointOrgToUser } from '../Service/OrgService';

const router = express.Router();

router.get('/create/:orgName',async (req : any,res) => {
    try {
        const orgName : string = req.params.orgName;
        const response = await createOrganizationForUser(req.user,orgName);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
});

router.post('/point',async (req : any ,res) => {
    try {
        const payload = req.body;
        const response = await pointOrgToUser(req.user,payload);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
})

router.get('/list',async(req,res) => {
    try {
        const response = await getAllOrgList();
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
})

//TODO app org to user endpoint

export default router;