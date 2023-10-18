import express from 'express';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { createSurveyFromTemplate, getTemplateDetails, getTemplateTestDisplay } from '../Service/TemplateService';
import { roleMiddleware } from '../MiddleWares/AuthMiddleware';

const router = express.Router();

router.get('/list', async (req, res) => {
    try {
        const response = await getTemplateDetails();
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/test-display/:templateId', async (req, res) => {
    try {
        const templateId = req.params.templateId;
        if (templateId == null || templateId.length < 1) { throw new Error('TemplateId not found.') }
        const response = await getTemplateTestDisplay(templateId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/create-survey/:templateId', roleMiddleware('ADMIN', 'OWNER', 'USER'), async (req, res) => {
    try {
        const templateId = req.params.templateId;
        if (templateId == null || templateId.length < 1) { throw new Error('TemplateId not found.') }
        const response = await createSurveyFromTemplate(templateId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;
