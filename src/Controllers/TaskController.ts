import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createTask, getTask } from '../Service/TaskService';

const router = express.Router();

router.post('/create',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createTask(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/get',async (req,res) => {
    try {
        const page = parseInt(req.query.page as string) || 0; // Current page number
        const limit = parseInt(req.query.limit as string) || 20; // Number of records per page
        const personId = req.query.personId as string;
        const companyId = req.query.companyId as string;
        const response = await getTask(companyId,personId,page,limit);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

export default router;