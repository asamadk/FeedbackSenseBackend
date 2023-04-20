import express from 'express';
import { getAllPlans } from '../Service/PlanService';
import { responseRest } from '../Types/ApiTypes';

const router = express.Router();

router.get('/list/all',async (req,res) => {
    const response : responseRest = await getAllPlans();
    res.statusCode = response.statusCode;
    res.json(response);
});

export default router;