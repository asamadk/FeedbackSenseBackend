import express from 'express';
import { getAllUsersOfSameOrg } from '../Service/UserService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
const router = express.Router();

router.get('/list/org', async (req : any,res) => {
    try {
        const userEmail = req.user.email;
        const response : responseRest = await getAllUsersOfSameOrg(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
})

export default router;