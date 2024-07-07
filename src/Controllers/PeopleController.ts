import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createPerson, deletePeople, fetchPersonFilledSurveys, getPersonList, getPersonSurveyScoreMetrics, updatePeople } from '../Service/PeopleService';

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
});

router.post('/delete',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await deletePeople(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/update',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await updatePeople(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/survey-response',async(req,res) => {
    try {
        const personId :string = req.query.personId as string;
        const response = await fetchPersonFilledSurveys(personId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

router.get('/survey-score-metrics',async(req,res) => {
    try {
        const personId :string = req.query.personId as string;
        const response = await getPersonSurveyScoreMetrics(personId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

export default router;
