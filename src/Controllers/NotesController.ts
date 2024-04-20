import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { createCSMNote, deleteCSMNote, getCSMNotes } from '../Service/NotesService';

const router = express.Router();


router.get('/get', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 0; // Current page number
        const limit = parseInt(req.query.limit as string) || 20; // Number of records per page
        const personId = req.query.personId as string;
        const companyId = req.query.companyId as string;
        const response = await getCSMNotes(companyId, personId, page, limit);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/create', async (req, res) => {
    try {
        const reqBody = req.body;
        const response = await createCSMNote(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.delete('/delete', async (req, res) => {
    try {
        const noteId = req.query.noteId;
        const response = await deleteCSMNote(noteId as string);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

export default router;