import express from 'express';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { createJourney, createSubJourney, getCustomerJourney, getCustomerSubJourney, updateCompanyJourney } from '../Service/JourneyStageService';

const router = express.Router();

router.post('/create',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createJourney(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.post('/create-sub-stage',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createSubJourney(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/get-stage',async (req,res) => {
    try {
        const response = await getCustomerJourney();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/get-sub-stage',async (req,res) => {
    try {
        const response = await getCustomerSubJourney();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.post('/update-company',async(req,res) => {
    try {
        const reqBody = req.body;
        const response = await updateCompanyJourney(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
})

export default router;