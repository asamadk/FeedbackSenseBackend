import express from 'express';
import { isLoggedIn } from '../MiddleWares/AuthMiddleware';
import { createSurvey, enableDisableSurvey, getAllSurveys, getDetailedSurvey, moveSurveyToFolder, saveSurveyFlow, softDeleteSurvey,saveSurveyDesign, updateSurveyConfig, getSurveyConfigData, updateSurveyName } from '../Service/SurveyService';
import { responseRest } from '../Types/ApiTypes';

const router = express.Router();

router.get('/details/:surveyId', async (req,res) => {
    const surveyId = req.params.surveyId;
    const response = await getDetailedSurvey(surveyId);
    res.statusCode = response.statusCode;
    res.json(response);
});


router.get('/list/:orgId' , async (req , res ) => {
    const orgId : string = req.params.orgId;
    const response = await getAllSurveys(orgId);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.post('/create/:surveyTypeId', async (req : any , res) => {
    const surveyTypeId : string = req.params.surveyTypeId;
    const response : responseRest = await createSurvey(surveyTypeId,req.user);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.post('/move/:folderId/:surveyId', async (req,res) => {
    const folderId = req.params.folderId;
    const surveyId = req.params.surveyId;
    const response = await moveSurveyToFolder(folderId,surveyId);
    res.statusCode = response.statusCode;
    res.json(response);
})

router.post('/disable/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await enableDisableSurvey(surveyId, false);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:45 ~ router.post ~ error:", error)
    }
})

router.post('/enable/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await enableDisableSurvey(surveyId, true);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:56 ~ router.post ~ error:", error)
    }
})

router.post('/delete/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await softDeleteSurvey(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:67 ~ router.post ~ error:", error)
    }
})

router.post('/save/flow/:surveyId', async (req,res) => {
    try {
        const reqBody = req.body;
        const surveyId = req.params.surveyId;
        const response = await saveSurveyFlow(surveyId,JSON.stringify(reqBody));
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:79 ~ router.post ~ error:", error)
    }
});

router.post('/save/design/:surveyId', async (req,res) => {
    try {
        const reqBody = req.body;
        const surveyId = req.params.surveyId;
        const response = await saveSurveyDesign(surveyId,JSON.stringify(reqBody));
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:91 ~ router.post ~ error:", error)
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
        console.log("🚀 ~ file: SurveyController.ts:103 ~ router.post ~ error:", error)
    }
});

router.get('/config/detail/:surveyId', async (req,res) => {
    try {
        const surveyId = req.params.surveyId;
        const response = await getSurveyConfigData(surveyId);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        console.log("🚀 ~ file: SurveyController.ts:114 ~ router.get ~ error:", error)
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
        console.log("🚀 ~ file: SurveyController.ts:126 ~ router.post ~ error:", error)
    }
});

export default router