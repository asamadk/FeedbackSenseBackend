import { Like } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Company } from "../Entity/CompanyEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { CompanyServiceHelper } from "../ServiceHelper/CompanyServiceHelper";
import { responseRest } from "../Types/ApiTypes";
import { parseCsvData } from "../Utils/CsvUtils";

export const createCompany = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const helper = new CompanyServiceHelper();
        if (helper.validateCreateCompanyPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }

        const company = new Company();
        company.name = reqBody.name;
        company.website = reqBody.website;
        company.industry = reqBody.industry;
        if (reqBody.lStage != null && reqBody.lStage.length > 0) {
            company.lifecycleStage = reqBody.lStage
        }
        if (reqBody.status != null && reqBody.status.length > 0) {
            company.status = reqBody.status
        }
        company.owner = reqBody.owner;
        // company.subscriptionPlan = reqBody.plan;
        company.address = reqBody.address;
        company.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any;
        company.totalContractAmount = reqBody.amount;

        const companyRepo = Repository.getCompany();

        await companyRepo.save(company);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCompanyList = async (page: number, limit: number, searchStr: string) => {
    try {
        const response = getDefaultResponse('Company fetched successfully');
        const offset = (page) * limit;

        const companyRepo = Repository.getCompany();
        const companyList = await companyRepo.find(
            {
                where: {
                    organization: {
                        id: AuthUserDetails.getInstance().getUserDetails().organization_id
                    },
                    name: Like(`%${searchStr}%`)
                },
                select: {
                    owner: {
                        id: true,
                        name: true
                    },
                    tags: {
                        id: true,
                        name: true
                    }
                },
                relations: {
                    tags: true,
                    owner: true
                },
                order: {
                    name: 'ASC'
                }
            }
        );

        const paginatedCompanies = companyList.slice(offset, offset + limit);

        response.data = {
            count: companyList.length,
            list: paginatedCompanies
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCompanyPeople = async (companyID: string) => {
    try {
        const response = getDefaultResponse('Company people fetched');
        const people = await Repository.getPeople().find({
            where: {
                company: {
                    id: companyID
                }
            },
            select: {
                company: {
                    id: true,
                    name: true
                }
            },
            relations: ['company']
        });
        response.data = people;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCompanyColumns = async () => {
    try {
        const response = getDefaultResponse('Company columns fetched');
        const companyRepo = Repository.getCompany()
        const columns: object = companyRepo.metadata.propertiesMap;
        const colList: string[] = [];
        for (const key in columns) {
            colList.push(key);
        }
        response.data = colList;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const handleBulkCompanyUpload = async (csv: string, fsFields: string, csvFields: string) => {
    try {
        const response = getDefaultResponse('Company columns fetched');
        const fsFieldStr = fsFields.split(',');
        const csvFieldStr = csvFields.split(',');

        const csvRecords = await parseCsvData(csv);
        if (csvRecords.length > 1000) {
            throw new Error('Bulk process is limited to "1000 record" per CSV file.');
        }

        const companies: Company[] = csvRecords.map(record => {
            const company = new Company();
            fsFieldStr.forEach((field, index) => {
                const csvField = csvFieldStr[index];
                if (csvField != null && csvField.length > 0) {
                    const data = record[csvField];
                    if (data) {
                        company[field] = data;
                    }
                }
            });
            company.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any;
            return company;
        });

        const companyRepo = Repository.getCompany();
        await companyRepo.save(companies);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const fetchCompaniesPeopleOptions = async () => {
    try {
        const response = getDefaultResponse('Company columns fetched');
        const userInfo = AuthUserDetails.getInstance().getUserDetails()
        const companyRepo = Repository.getCompany();
        const peopleRepo = Repository.getPeople();

        const company = await companyRepo.find({
            where : { 
                organization : {
                    id : userInfo.organization_id
                }
            },
            select : {
                id : true,
                name : true,
            }
        });

        const people = await peopleRepo.find({
            where : { 
                organization : {
                    id : userInfo.organization_id
                }
            },
            select : {
                id : true,
                firstName : true,
                lastName : true,
                company : {
                    id : true
                }
            },
            relations : {
                company : true
            }
        });

        response.data = {
            companies : company,
            people : people
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}