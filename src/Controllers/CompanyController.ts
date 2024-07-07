import express from 'express';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import multer from 'multer';
import { createCompany, deleteCompanies, fetchCompaniesFilledSurveys, fetchCompaniesPeopleOptions, getCompanyColumns, getCompanyHealthHistory, getCompanyList, getCompanyPeople, getCompanySurveyScoreMetrics, getIndividualCompany, handleBulkCompanyUpload, updateCompany } from '../Service/CompanyService';

const router = express.Router();

const upload = multer();

router.post('/create/individual',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await createCompany(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/update',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await updateCompany(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/get/list',async (req,res) => {
    try {
        const page = parseInt(req.query.page as string) || 0; // Current page number
        const limit = parseInt(req.query.limit as string) || 20; // Number of records per page
        const searchStr = req.query.search as string || '';

        const response = await getCompanyList(page,limit,searchStr);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/get',async (req,res) => {
    try {
        const companyId = req.query.companyId as string;
        const response = await getIndividualCompany(companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/delete',async (req,res) => {
    try {
        const reqBody = req.body;
        const response = await deleteCompanies(reqBody);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/people/:companyId',async (req,res) => {
    try {
        const compId = req.params.companyId;
        const response = await getCompanyPeople(compId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/column-metadata',async (req,res) => {
    try {
        const response = await getCompanyColumns();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.post('/bulk/upload',upload.single('csvFile'),async (req,res) => {
    try {
        const reqBody = req.body;
        const fsFields = reqBody.fsFields;
        const csvFields = reqBody.csvField;
        const csvFile = reqBody.csvFile;

        if (!csvFile) {
            throw new Error('No CSV file uploaded');
        }
        const response = await handleBulkCompanyUpload(csvFile,fsFields,csvFields);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false)); 
    }
});

router.get('/select-options',async (req,res) => {
    try {
        const response = await fetchCompaniesPeopleOptions();
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

router.get('/health-history-chart',async(req,res) => {
    try {
        const companyId :string = req.query.companyId as string;
        const response = await getCompanyHealthHistory(companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

router.get('/survey-response',async(req,res) => {
    try {
        const companyId :string = req.query.companyId as string;
        const response = await fetchCompaniesFilledSurveys(companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

router.get('/survey-score-metrics',async(req,res) => {
    try {
        const companyId :string = req.query.companyId as string;
        const response = await getCompanySurveyScoreMetrics(companyId);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));  
    }
});

export default router;