import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createTags, deleteCompanyTag, getOrgTags } from '../Service/TagService';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const reqBody = req.body;
        const response = await createTags(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.delete('/remove', async (req, res) => {
    try {
        const companyId :string | null = req.query.companyId as string | null;
        const tagId :string | null = req.query.tagId as string | null;
        const response = await deleteCompanyTag(companyId,parseInt(tagId));
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/list', async (req, res) => {
    try {
        const response = await getOrgTags();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;