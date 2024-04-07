import { FindOneOptions } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Task } from "../Entity/TaskEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { TaskServiceHelper } from "../ServiceHelper/TaskServiceHelper";
import { responseRest } from "../Types/ApiTypes";

export const createTask = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const helper = new TaskServiceHelper();
        if (helper.validateCreateTaskPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }

        const userInfo = AuthUserDetails.getInstance().getUserDetails();

        const task = new Task();
        if (reqBody.personID) {
            task.person = reqBody.personID;
        }
        if (reqBody.companyID) {
            task.company = reqBody.companyID;
        }
        task.title = reqBody.title;
        task.description = reqBody.description;
        task.owner = userInfo.id as any;
        task.priority = reqBody.priority;
        task.dueDate = reqBody.dueDate;
        task.status = reqBody.status;
        task.organization = userInfo.organization_id as any;

        const taskRepo = Repository.getTask();
        await taskRepo.save(task);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getTask = async (
    companyId: string, personId: string, page: number, limit: number
): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Company created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const offset = (page) * limit;

        const whereClause: any = {};

        if (personId != null && personId.length > 0) {
            whereClause.person = {
                id: personId
            }
        }
        if (companyId != null && companyId.length > 0) {
            whereClause.company = {
                id: companyId
            }
        }

        const taskRepo = Repository.getTask();
        const res = await taskRepo.find({
            where: { ...whereClause, organization: { id: userInfo.organization_id } },
            select : {
                company : {
                    id : true,
                    name : true
                },
                person : {
                    id : true,
                    firstName : true,
                    lastName : true
                }
            },
            relations : {
                person : true,
                company : true
            },
            skip: offset,
            take: limit
        });

        response.data = res;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}