import express from 'express';
import { getAllPlans } from '../Service/PlanService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/list/all',async (req,res) => {
    try {
        const response : responseRest = await getAllPlans();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
});

export default router;