import express from 'express';
import { getSubScriptionDetailsHome } from '../Service/SubscriptionService';
import { responseRest } from '../Types/ApiTypes';

const router = express.Router();

router.get('/sub/details/:userId',async(req,res) => {
    const userId : string = req.params.userId;
    const response : responseRest = await getSubScriptionDetailsHome(userId);
    res.statusCode = response.statusCode;
    res.json(response);
})

export default router;