import express from 'express';
import { deleteFeedbackResponse, exportSurveyDataToCSV, exportSurveyDataToJSON, getFeedbackResponseList, getOverAllComponentsData, getOverallResponse, getSubDataResponse, getSurveyFilterData } from '../Service/AnalysisService';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { roleMiddleware } from '../MiddleWares/AuthMiddleware';
import { durationType } from '../Types/ApiTypes';

const router = express.Router();

router.get('/response/list/:surveyId', async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getFeedbackResponseList(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.delete('/response/:surveyResponseId', roleMiddleware('ADMIN', 'OWNER'), async (req, res) => {
    try {
        const surveyResponseId = req.params.surveyResponseId;
        const response = await deleteFeedbackResponse(surveyResponseId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/response/overall/:surveyId', async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const reqQuery :durationType = req.query as durationType;
        if (reqQuery == null || reqQuery.endDate == null || reqQuery.startDate == null || surveyId == null || surveyId?.length < 1) {
            res.json(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getOverallResponse(surveyId,reqQuery);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/response/sub-data/:surveyId', async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const reqQuery :durationType = req.query as durationType;
        if (reqQuery == null || reqQuery.endDate == null || reqQuery.startDate == null || surveyId == null || surveyId?.length < 1) {
            res.status(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getSubDataResponse(surveyId,reqQuery);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/response/components/:surveyId', async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const reqQuery :durationType = req.query as durationType;
        const filterPayload = req.body;
        if (reqQuery == null || reqQuery.endDate == null || reqQuery.startDate == null || surveyId == null || surveyId?.length < 1) {
            res.status(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getOverAllComponentsData(surveyId,reqQuery,filterPayload);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/response/filter-data/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        if (surveyId == null || surveyId?.length < 1) {
            res.status(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getSurveyFilterData(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/export/csv/:surveyId', roleMiddleware('ADMIN', 'OWNER', 'USER'), async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        if (surveyId == null || surveyId?.length < 1) {
            res.status(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await exportSurveyDataToCSV(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

router.get('/export/json/:surveyId', roleMiddleware('ADMIN', 'OWNER', 'USER'), async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        if (surveyId == null || surveyId?.length < 1) {
            res.status(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await exportSurveyDataToJSON(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;