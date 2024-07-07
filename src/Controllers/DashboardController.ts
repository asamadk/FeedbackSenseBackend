import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { getClientCompassDashboardData } from '../Service/DashboardService';

const router = express.Router();

router.get('/client-compass',async (req,res) => {
    try {
        const type :string = req.query.type as string;
        const date :string = req.query.date as string;
        const response = await getClientCompassDashboardData(date,type);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

export default router;