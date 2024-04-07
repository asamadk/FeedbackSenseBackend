import { Like } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Person } from "../Entity/PersonEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { PeopleServiceHelper } from "../ServiceHelper/PeopleServiceHelper";
import { responseRest } from "../Types/ApiTypes";

export const createPerson = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('People created successfully');
        const helper = new PeopleServiceHelper();
        if (helper.validateCreatePersonPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }
        const personRepo = Repository.getPeople();
        const person = new Person();
        person.firstName = reqBody.firstName;
        person.lastName = reqBody.lastName;
        person.email = reqBody.email;
        person.phone = reqBody.phone;
        person.title = reqBody.title;
        person.company = reqBody.company;
        person.communicationPreferences = reqBody.commPref;
        person.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any

        await personRepo.save(person);
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
                where: {
                    organization: {
                        id: AuthUserDetails.getInstance().getUserDetails().organization_id
                    },
                    firstName: Like(`%${searchStr}%`)
                },
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