import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { getTimeSpentOverTime, getEventsOverTime, getTopUsagePeople, getUsageStatus } from '../Service/UsageEventService';

const router = express.Router();

router.get('/events-over-time',async (req,res) => {
    try {
        const timeInterval : string | null = req.query.interval as string | null;
        const personId : string | null = req.query.personId as string | null;
        const companyId : string | null = req.query.companyId as string | null;
        const response = await getEventsOverTime(timeInterval,personId,companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/time-spent',async (req,res) => {
    try{
        const timeInterval : string | null = req.query.interval as string | null;
        const personId : string | null = req.query.personId as string | null;
        const companyId : string | null = req.query.companyId as string | null;
        const response = await getTimeSpentOverTime(timeInterval,personId,companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    }catch(error){
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/top-people',async (req,res) => {
    try{
        const timeInterval : string | null = req.query.interval as string | null;
        const companyId : string | null = req.query.companyId as string | null;
        const response = await getTopUsagePeople(timeInterval,companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    }catch(error){
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/usage-status',async (req,res) => {
    try{
        const response = await getUsageStatus();
        res.statusCode = response.statusCode;
        res.json(response);
    }catch(error){
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

export default router;