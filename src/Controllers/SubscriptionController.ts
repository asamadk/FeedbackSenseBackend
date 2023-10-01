import express from 'express';
import { getSubScriptionDetailsHome, informSupportUserPricing } from '../Service/SubscriptionService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';

const router = express.Router();

router.get('/sub/details',async(req : any,res) => {
    try {
        const userEmail = req.user.email;
        const response : responseRest = await getSubScriptionDetailsHome(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/support',async(req,res) => {
    try {
        const reqBody = req.body;
        const response : responseRest = await informSupportUserPricing(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

export default router;