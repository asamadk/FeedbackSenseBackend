import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { getUsageJavaScript } from '../Service/UsageService';

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

export default router;