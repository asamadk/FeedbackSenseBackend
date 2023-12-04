import express from 'express';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { fetchDashboardSettings } from '../Service/CustomSettingsService';

const router = express.Router();

router.get('/dashboard-settings', async (req, res) => {
    try {
        const response = await fetchDashboardSettings();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;
