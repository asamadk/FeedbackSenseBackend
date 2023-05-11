import express from 'express';
import { getLiveSurveyNodes, saveSurveyResponse } from '../Service/LiveSurveyService';
import { responseRest } from '../Types/ApiTypes';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';

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
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/survey/response/:surveyId',(req,res) => {
    try {
        const surveyId = req.params.surveyId
        saveSurveyResponse(surveyId,req.body);
        res.status(200).json({});
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router;