import express from 'express';
import { getAllUsersOfSameOrg } from '../Service/UserService';
import { responseRest } from '../Types/ApiTypes';
const router = express.Router();

router.get('/list/org/:orgId', async (req,res) => {
    const orgId : string = req.params.orgId;
    const response : responseRest = await getAllUsersOfSameOrg(orgId);
    res.statusCode = response.statusCode;
    res.json(response);
})

export default router;