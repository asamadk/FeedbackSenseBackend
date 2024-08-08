import { Like } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Person } from "../Entity/PersonEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { PeopleServiceHelper } from "../ServiceHelper/PeopleServiceHelper";
import { responseRest } from "../Types/ApiTypes";
import { PersonTrigger } from "../Triggers/PersonTrigger";

export const createPerson = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('People created successfully');
        const helper = new PeopleServiceHelper();
        if (helper.validateCreatePersonPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }
        
        const person = new Person();
        person.firstName = reqBody.firstName;
        person.lastName = reqBody.lastName;
        person.email = reqBody.email;
        person.phone = reqBody.phone;
        person.title = reqBody.title;
        person.company = reqBody.company;
        person.communicationPreferences = reqBody.commPref;
        person.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any

        await PersonTrigger.save(person);
        response.data =  person;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getPersonList = async (page: number, limit: number, searchStr: string) => {
    try {
        const response = getDefaultResponse('Person fetched successfully');
        const offset = (page) * limit;
        const peopleRepo = Repository.getPeople();
        const peopleList = await peopleRepo.find(
            {
                where: [
                    {
                        organization: {
                            id: AuthUserDetails.getInstance().getUserDetails().organization_id
                        },
                        firstName: Like(`%${searchStr}%`)
                    },
                    {
                        organization: {
                            id: AuthUserDetails.getInstance().getUserDetails().organization_id
                        },
                        lastName: Like(`%${searchStr}%`)
                    }
                ],
                select: {
                    company: {
                        id: true,
                        name: true
                    }
                },
                relations: ['company'],
                order: {
                    firstName: 'ASC'
                }
            }
        );
        const paginatedPeople = peopleList.slice(offset, offset + limit);

        response.data = {
            count: peopleList.length,
            list: paginatedPeople
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deletePeople = async (personIds: string[]): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const personRepo = Repository.getPeople();
        if (personIds != null && personIds.length > 0) {
            await personRepo.delete(personIds);
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updatePeople = async (payload: any) => {
    try {
        const response = getDefaultResponse('Person updated');
        await PersonTrigger.save(payload);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const fetchPersonFilledSurveys = async (personId: string) => {
    try {
        const response = getDefaultResponse('Person surveys fetched');
        if (personId == null || personId.length < 1) {
            throw new Error(`Person ID not provided.`);
        }

        const surveyResponseRepo = Repository.getSurveyResponse();
        const surveyResponse = await surveyResponseRepo.find({
            where: {
                person: {
                    id: personId
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

export const getPersonSurveyScoreMetrics = async (personId: string) => {
    try {
        const response = getDefaultResponse('Company surveys fetched');

        const peopleRepo = Repository.getPeople();
        const person = await peopleRepo.findOne(
            {
                where: { id: personId },
                select: {
                    company: {
                        id : true,
                        npsScore: true,
                        avgNpsScore: true,
                        avgCsatScore: true,
                        csatScore: true
                    }
                },
                relations: { company: true }
            }
        );
        let transformedData = [];
        if (person != null) {
            transformedData = [
                { name: 'Latest NPS Score', score: person.company.npsScore || '0' },
                { name: 'Average NPS Score', score: person.company.avgNpsScore || '0' },
                { name: 'Latest CSAT Score', score: person.company.csatScore || '0' },
                { name: 'Average CSAT Score', score: person.company.avgCsatScore || '0' },
            ]
        }
        response.data = transformedData;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}