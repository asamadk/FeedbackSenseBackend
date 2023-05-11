import express from 'express';
import { getAllPlans } from '../Service/PlanService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';

const router = express.Router();

router.get('/list/all',async (req,res) => {
    try {
        const response : responseRest = await getAllPlans();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

export default router;