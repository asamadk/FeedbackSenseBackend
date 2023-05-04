import express from 'express';
import { deleteFeedbackResponse, getFeedbackResponseList, getOverAllComponentsData, getOverallResponse, getSubDataResponse } from '../Service/AnalysisService';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/response/list/:surveyId',async(req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getFeedbackResponseList(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
});

router.delete('/response/:surveyResponseId',async (req,res) => {
    try {
        const surveyResponseId = req.params.surveyResponseId;
        const response = await deleteFeedbackResponse(surveyResponseId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
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
        console.warn("🚀 ~ file: AnalysisController.ts:34 ~ router.get ~ error:", error);
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
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
        console.warn("🚀 ~ file: AnalysisController.ts:34 ~ router.get ~ error:", error);
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
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
        console.warn("🚀 ~ file: AnalysisController.ts:62 ~ router.get ~ error:", error);
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
})

export default router;