import express from 'express';
import { getSubScriptionDetailsHome } from '../Service/SubscriptionService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.get('/sub/details/:userId',async(req,res) => {
    try {
        const userId : string = req.params.userId;
        const response : responseRest = await getSubScriptionDetailsHome(userId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
})

export default router;