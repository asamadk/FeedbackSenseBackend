import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { completeTask, createTask, deleteTask, getTask, updateTask } from '../Service/TaskService';

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
        const status = req.query.status as string;
        const owner = req.query.ownerId as string;
        const response = await getTask(companyId,personId,status,owner,page,limit);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.delete('/delete',async (req,res) => {
    try {
        const taskId = req.query.taskId as string;
        const response = await deleteTask(taskId);
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
        const response = await updateTask(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.post('/complete-task',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await completeTask(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

export default router;