import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { getOnboardingStatus } from '../Service/HomeService';

const router = express.Router();

router.get('/onboarding',async(req,res) => {
    try{
        const response = await getOnboardingStatus();
        res.statusCode = response.statusCode;
        res.json(response);
    }catch(error){
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;