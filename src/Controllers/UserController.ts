import express from 'express';
import { getAllUsersOfSameOrg } from '../Service/UserService';
import { responseRest } from '../Types/ApiTypes';
import { getCustomResponse } from '../Helpers/ServiceUtils';
const router = express.Router();

router.get('/list/org', async (req : any,res) => {
    try {
        const userEmail = req.user._json.email;
        const response : responseRest = await getAllUsersOfSameOrg(userEmail);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        res.status(500).json(getCustomResponse([], 500, 'An exception occurred', false));
    }
})

export default router;