import express from 'express';
import { createSurvey, enableDisableSurvey, getAllSurveys, getDetailedSurvey, moveSurveyToFolder, saveSurveyFlow, permDeleteSurvey,saveSurveyDesign, updateSurveyConfig, getSurveyConfigData, updateSurveyName, checkIfSurveyHasResponse, duplicateSurvey } from '../Service/SurveyService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { getUserEmailFromRequest } from '../Helpers/RestUtils';
import { logger } from '../Config/LoggerConfig';

const router = express.Router();

router.get('/details/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getDetailedSurvey(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);     
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});


router.get('/list' , async (req , res ) => {
    try {
        const userEmail = getUserEmailFromRequest(req);
        const response = await getAllSurveys(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/create/:surveyName', async (req :any , res) => {
    try {
        const surveyName : string = req.params.surveyName;
        if(surveyName == null || surveyName.length < 1){
            throw new Error('Survey name is empty');
        }
        const response : responseRest = await createSurvey(surveyName,req.user);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/move/:folderId/:surveyId', async (req,res) => {
    try {
        const folderId = req.params.folderId;
        const surveyId = req.params.surveyId;
        const response = await moveSurveyToFolder(folderId,surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.post('/disable/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await enableDisableSurvey(surveyId, false);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.post('/enable/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await enableDisableSurvey(surveyId, true);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.post('/delete/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await permDeleteSurvey(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.post('/save/flow/:surveyId', async (req,res) => {
    try {
        const reqBody = req.body;
        const surveyId = req.params.surveyId;
        const deleteResponses = req.query?.delete;
        const response = await saveSurveyFlow(surveyId,JSON.stringify(reqBody),deleteResponses === 'true');
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/save/check/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await checkIfSurveyHasResponse(surveyId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

router.post('/save/design/:surveyId', async (req,res) => {
    try {
        const reqBody = req.body;
        const surveyId = req.params.surveyId;
        const response = await saveSurveyDesign(surveyId,JSON.stringify(reqBody));
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/config/update/:surveyId',async(req,res) => {
    try {
        const reqBody = req.body;
        const surveyId = req.params.surveyId;
        const response = await updateSurveyConfig(surveyId,reqBody);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/config/detail/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getSurveyConfigData(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/update/name/:surveyId',async(req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const payload = req.body;
        const response = await updateSurveyName(surveyId,payload);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.post('/duplicate/:surveyId',async (req,res) => {
    try {
        const surveyId = req.params.surveyId as string;
        if(surveyId == null || surveyId.length < 1){
            throw new Error('Survey Id not provided.');
        }
        const response = await duplicateSurvey(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router