import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createPerson, getPersonList } from '../Service/PeopleService';

const router = express.Router();

router.post('/create/individual',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createPerson(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

router.get('/get/list',async (req,res) => {
    try {
        const page = parseInt(req.query.page as string) || 0; // Current page number
        const limit = parseInt(req.query.limit as string) || 20; // Number of records per page
        const searchStr = req.query.search as string || '';

        const response = await getPersonList(page,limit,searchStr);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;
