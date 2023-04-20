import express from 'express';
import { getAllSurveyType } from '../Service/SurveyTypeService';

const router = express.Router();

router.get('/list', async (req,res) => {
    const response = await getAllSurveyType();
    res.statusCode = response.statusCode;
    res.json(response);
})

export default router;