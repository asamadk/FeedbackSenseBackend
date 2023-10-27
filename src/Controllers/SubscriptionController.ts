import express from 'express';
import { getSubScriptionDetailsHome, informSupportUserPricing, initializePayment } from '../Service/SubscriptionService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { roleMiddleware } from '../MiddleWares/AuthMiddleware';

const router = express.Router();

router.get('/sub/details', roleMiddleware('ADMIN', 'OWNER'), async (req: any, res) => {
    try {
        const userEmail = req.user.email;
        const response: responseRest = await getSubScriptionDetailsHome(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/support', roleMiddleware('ADMIN', 'OWNER'), async (req, res) => {
    try {
        const reqBody = req.body;
        const response: responseRest = await informSupportUserPricing(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/initialize/payment',roleMiddleware('ADMIN','OWNER'), async (req,res) => {
    try {
        const reqBody = req.body;
        const response: responseRest = await initializePayment(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;