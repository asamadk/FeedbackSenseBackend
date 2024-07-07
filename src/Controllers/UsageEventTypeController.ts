import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createUsageEventType, deleteUsageEventType, getUsageEventType } from '../Service/UsageEventTypeService';

const router = express.Router();

router.post('/create',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createUsageEventType(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/list',async (req,res) => {
    try {
        const response = await getUsageEventType();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.delete('/delete',async (req,res) => {
    try {
        const typeId : string | null = req.query.usageEventTypeId as string | null;
        const response = await deleteUsageEventType(typeId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

export default router;