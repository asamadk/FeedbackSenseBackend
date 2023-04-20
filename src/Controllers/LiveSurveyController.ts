import express from 'express';
import { getLiveSurveyNodes, saveSurveyResponse } from '../Service/LiveSurveyService';
import { responseRest } from '../Types/ApiTypes';

const router = express.Router();

router.get('/survey/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        if(surveyId == null || surveyId === ''){
            res.status(409).json({
                statusCode : 409,
                data : null,
                message : 'Survey Id not provided',
                success : false
            });
        }
        
        const response : responseRest = await getLiveSurveyNodes(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        console.log("🚀 ~ file: LiveSurveyController.ts:23 ~ router.get ~ error:", error);
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
});

router.post('/survey/response/:surveyId',(req,res) => {
    try {
        const surveyId = req.params.surveyId
        saveSurveyResponse(surveyId,req.body);
        res.status(200).json({});
    } catch (error) {
        console.log("🚀 ~ file: LiveSurveyController.ts:31 ~ router.post ~ error:", error)
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
})

export default router;