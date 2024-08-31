import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { checkGoogleIntegrationStatus, disconnectGoogleIntegration, getGoogleAuthURL } from '../Service/IntegrationService';
const router = express.Router();

router.get('/google/auth/url',async (req,res) => {
    try {
        const response = await getGoogleAuthURL();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/google/check',async (req,res) => {
    try {
        const response = await checkGoogleIntegrationStatus();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/google/disconnect',async (req,res) => {
    try {
        const response = await disconnectGoogleIntegration();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;