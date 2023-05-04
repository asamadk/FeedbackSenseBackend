import express from 'express';
import { getAllSurveyType } from '../Service/SurveyTypeService';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/list', async (req,res) => {
    try {
        const response = await getAllSurveyType();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
})

export default router;