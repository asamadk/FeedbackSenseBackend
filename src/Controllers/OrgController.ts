import express from 'express';
import { createOrganizationForUser, getAllOrgList, pointOrgToUser } from '../Service/OrgService';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.post('/create',async (req : any,res) => {
    try {
        const reqBody = req.body;
        const response = await createOrganizationForUser(req.user,reqBody);
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