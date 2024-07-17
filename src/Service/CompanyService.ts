import { Like, MoreThan } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Company } from "../Entity/CompanyEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { CompanyServiceHelper } from "../ServiceHelper/CompanyServiceHelper";
import { responseRest } from "../Types/ApiTypes";
import { parseCsvData } from "../Utils/CsvUtils";
import { CompanyHistory } from "../Entity/CompanyHistory";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { TOTAL_CUSTOMER } from "../Constants/CustomSettingsCont";
import { CompanyTrigger } from "../Triggers/CompanyTrigger";

export const createCompany = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const helper = new CompanyServiceHelper();
        if (helper.validateCreateCompanyPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }

        const companyRepo = Repository.getCompany();
        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        const [totalCompanies,tmp] = await Promise.all([
            companyRepo.count({where : {organization : {id : userInfo.organization_id}}}),
            CustomSettingsHelper.getInstance().initialize(userInfo.organization_id)
        ]);

        let totalCustomerLimit :any = CustomSettingsHelper.getInstance().getCustomSettings(TOTAL_CUSTOMER);
        totalCustomerLimit = CustomSettingsHelper.parseValue(totalCustomerLimit);

        if(totalCompanies >= totalCustomerLimit){
            throw new Error('Total companies limit reached');
        }

        const company = new Company();
        company.name = reqBody.name;
        company.website = reqBody.website;
        company.industry = reqBody.industry;

        if (reqBody.status != null && reqBody.status.length > 0) {
            company.contractStatus = reqBody.status
        }
        if (reqBody.id != null && reqBody.id.length > 0) {
            company.id = reqBody.id;
        }
        company.owner = reqBody.owner;
        company.address = reqBody.address;
        company.organization = userInfo.organization_id as any;
        company.totalContractAmount = reqBody.amount;

        await CompanyTrigger.save(company);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteCompanies = async (companyIds: string[]): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const companyRepo = Repository.getCompany();
        if (companyIds != null && companyIds.length > 0) {
            await companyRepo.delete(companyIds);
        }
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
                    },
                    stage: {
                        id: true,
                        name: true,
                        position: true
                    },
                    onboardingStage: {
                        id: true,
                        name: true
                    },
                    riskStage: {
                        id: true,
                        name: true
                    },
                    pointOfContact : {
                        id : true,
                        firstName : true,
                        lastName : true
                    }
                },
                relations: {
                    tags: true,
                    owner: true,
                    stage: true,
                    onboardingStage: true,
                    riskStage: true,
                    pointOfContact : true
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

export const getIndividualCompany = async (id: string) => {
    try {
        const response = getDefaultResponse('Company fetched successfully');

        const companyRepo = Repository.getCompany();
        const companyList = await companyRepo.find(
            {
                where: {
                    id: id
                },
                select: {
                    owner: {
                        id: true,
                        name: true
                    },
                    tags: {
                        id: true,
                        name: true
                    },
                    stage: {
                        id: true,
                        name: true,
                        position: true
                    },
                    onboardingStage: {
                        id: true,
                        name: true
                    },
                    riskStage: {
                        id: true,
                        name: true
                    }
                },
                relations: {
                    tags: true,
                    owner: true,
                    stage: true,
                    onboardingStage: true,
                    riskStage: true
                },
                order: {
                    name: 'ASC'
                }
            }
        );

        response.data = companyList;
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
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
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
            company.organization = userInfo.organization_id as any;
            return company;
        });

        const companyRepo = Repository.getCompany();

        const [totalCompanies,tmp] = await Promise.all([
            companyRepo.count({where : {organization : {id : userInfo.organization_id}}}),
            CustomSettingsHelper.getInstance().initialize(userInfo.organization_id)
        ]);

        let totalCustomerLimit :any = CustomSettingsHelper.getInstance().getCustomSettings(TOTAL_CUSTOMER);
        totalCustomerLimit = CustomSettingsHelper.parseValue(totalCustomerLimit);

        if((totalCompanies + companies.length) >=  totalCustomerLimit){
            throw new Error('Total companies limit reached');
        }

        await CompanyTrigger.saveBulk(companies);
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
            where: {
                organization: {
                    id: userInfo.organization_id
                }
            },
            select: {
                id: true,
                name: true,
            },
            order: {
                name: 'ASC'
            }
        });

        const people = await peopleRepo.find({
            where: {
                organization: {
                    id: userInfo.organization_id
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                company: {
                    id: true,
                    name: true
                }
            },
            relations: {
                company: true
            },
            order: {
                firstName: 'ASC'
            }
        });

        response.data = {
            companies: company,
            people: people
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const fetchCompaniesFilledSurveys = async (companyId: string) => {
    try {
        const response = getDefaultResponse('Company surveys fetched');
        if (companyId == null || companyId.length < 1) {
            throw new Error(`Company ID not provided.`);
        }

        const surveyResponseRepo = Repository.getSurveyResponse();
        const surveyResponse = await surveyResponseRepo.find({
            where: {
                company: {
                    id: companyId
                }
            },
            select: {
                person: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
                survey: {
                    id: true,
                    name: true
                }
            },
            relations: {
                person: true,
                survey: true
            },
            order: {
                created_at: 'DESC'
            }
        });

        response.data = {
            list: surveyResponse
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCompanyHealthHistory = async (companyId: string) => {
    try {
        const response = getDefaultResponse('Company surveys fetched');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const historyRepo = Repository.getCompanyHistory();
        const historyRecords = await historyRepo.find({
            where: {
                companyId: companyId,
                fieldName: 'healthScore',
                actionDate: MoreThan(thirtyDaysAgo)
            },
            order: {
                actionDate: 'ASC'
            }
        });
        const transformedData = historyRecords.map(record => {
            return {
                name: record.actionDate.toLocaleDateString(),  // Format date as 'MM/DD/YYYY', customize as needed
                health: parseInt(record.extraInfo)  // Assuming 'extraInfo' stores the health score as a string
            };
        });
        response.data = transformedData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getCompanySurveyScoreMetrics = async (companyId: string) => {
    try {
        const response = getDefaultResponse('Company surveys fetched');

        const companyRepo = Repository.getCompany();
        const company = await companyRepo.findOne({ where: { id: companyId } });
        let transformedData = [];
        if (company != null) {
            transformedData = [
                { name: 'Latest NPS Score', score: company.npsScore || '0' },
                { name: 'Average NPS Score', score: company.avgNpsScore || '0' },
                { name: 'Latest CSAT Score', score: company.csatScore || '0' },
                { name: 'Average CSAT Score', score: company.avgCsatScore || '0' },
            ]
        }
        response.data = transformedData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateCompany = async (payload: any) => {
    try {
        const response = getDefaultResponse('Company updated');
        const histories = [];

        for (const key in payload) {
            if (key.toLowerCase() === 'id') { continue; }
            const history = new CompanyHistory();
            history.companyId = payload.id;
            history.fieldName = key;
            history.actionType = 'Update';
            history.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any;
            history.extraInfo = payload[key]; //stores new contract value
            histories.push(history);
        }

        await Promise.all([
            CompanyTrigger.save(payload),
            Repository.getCompanyHistory().save(histories)
        ]);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}