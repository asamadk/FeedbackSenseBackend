import express from 'express';
import { createOrganizationForUser, getAllOrgList, pointOrgToUser } from '../Service/OrgService';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/create/:orgName',async (req : any,res) => {
    try {
        const orgName : string = req.params.orgName;
        const response = await createOrganizationForUser(req.user,orgName);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/point',async (req : any ,res) => {
    try {
        const payload = req.body;
        const response = await pointOrgToUser(req.user,payload);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.get('/list',async(req,res) => {
    try {
        const response = await getAllOrgList();
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router;