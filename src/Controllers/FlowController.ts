import express from 'express';
import { createAutomationFlows, getAutomationFlowById, getAutomationFlows, publishAutomationFlow, unPublishAutomationFlow, updateAutomationFlow, updateAutomationFlowJSON } from '../Service/FlowService';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { ZodError, z } from 'zod';
import { flowTypes } from '../Entity/FlowEntity';
const router = express.Router();

router.get('/all', async (req, res) => {
    try {
        const response = await getAutomationFlows();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/create', async (req, res) => {
    try {
        const payloadVerification = z.object({
            name: z.string().min(1),
            type: z.string().min(4)
        });

        const { name, type } = payloadVerification.parse(req.body);
        const response = await createAutomationFlows(name,type as flowTypes);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(err => err.message).join(", ");
            logger.error(`Payload validation error - ${errorMessages}`);
            res.json(getCustomResponse(null, 401, errorMessages, false));
        } else {
            logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
            res.status(500).json(getCustomResponse(null, 500, error.message, false));
        }
    }
});

router.get('/one', async (req, res) => {
    try {
        const flowId :string | null = req.query.flowId as string | null;
        const response = await getAutomationFlowById(flowId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/update-attribute', async (req, res) => {
    try {
        const reqBody = req.body;
        const response = await updateAutomationFlow(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/update-flow-json', async (req, res) => {
    try {
        const reqBody = req.body;
        const response = await updateAutomationFlowJSON(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/publish', async (req, res) => {
    try {
        const flowID = req.query.flowId;
        const response = await publishAutomationFlow(flowID as string);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/unpublish', async (req, res) => {
    try {
        const flowID = req.query.flowId;
        const response = await unPublishAutomationFlow(flowID as string);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;