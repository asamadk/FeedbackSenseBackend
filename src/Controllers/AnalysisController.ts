import express from 'express';
import { deleteFeedbackResponse, getFeedbackResponseList, getOverAllComponentsData, getOverallResponse, getSubDataResponse } from '../Service/AnalysisService';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';

const router = express.Router();

router.get('/response/list/:surveyId',async(req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getFeedbackResponseList(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.delete('/response/:surveyResponseId',async (req,res) => {
    try {
        const surveyResponseId = req.params.surveyResponseId;
        const response = await deleteFeedbackResponse(surveyResponseId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/response/overall/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        if(surveyId == null || surveyId?.length < 1){
            res.json(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getOverallResponse(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/response/sub-data/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        if(surveyId == null || surveyId?.length < 1){
            res.json(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getSubDataResponse(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/response/components/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        if(surveyId == null || surveyId?.length < 1){
            res.json(400).json(getCustomResponse([], 400, 'Survey Id is not provided.', false));
            return;
        }
        const response = await getOverAllComponentsData(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router;