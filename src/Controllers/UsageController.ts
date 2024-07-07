import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createUsageEvent, createUsageSession, getUsageJavaScript } from '../Service/UsageService';

const router = express.Router();

router.get('/feedbacksense/v1',async (req,res) => {
    try {
        const jsContent = getUsageJavaScript();
        res.setHeader('Content-Type', 'application/javascript');
        res.send(jsContent);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/event/v1',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createUsageEvent(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/session/v1',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createUsageSession(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

export default router;