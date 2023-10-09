import express from 'express';
import { getAllUsersOfSameOrg, handleInviteUsers, removeUserFromOrg, updateUserRole } from '../Service/UserService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { roleMiddleware } from '../MiddleWares/AuthMiddleware';
const router = express.Router();

router.get('/list/org', async (req: any, res) => {
    try {
        const userEmail = req.user.email;
        const response: responseRest = await getAllUsersOfSameOrg(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/delete/org', roleMiddleware('OWNER'), async (req, res) => {
    try {
        const { userId } = req.body;
        const response = await removeUserFromOrg(userId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/role', roleMiddleware('ADMIN', 'OWNER'), async (req, res) => {
    try {
        const { userId, role } = req.body;
        const response = await updateUserRole(userId, role);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/invite', roleMiddleware('ADMIN', 'OWNER'), async (req, res) => {
    try {
        const { email, role } = req.body;
        const response = await handleInviteUsers(email, role);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;