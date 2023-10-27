import express from 'express';
import { createOrganizationForUser } from '../Service/OrgService';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';

const router = express.Router();

router.post('/create', async (req: any, res) => {
    try {
        const reqBody = req.body;
        const response = await createOrganizationForUser(req.user, reqBody);
        res.statusCode = response.statusCode;
        // req.logout();
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;