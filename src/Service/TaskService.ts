import { FindOneOptions, FindOptionsWhere } from "typeorm";
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
            const personRepo = Repository.getPeople();
            const person = await personRepo.findOneBy({
                id: reqBody.personID
            });
            task.person = [person];
        }

        if (reqBody.companyID) {
            const companyRepo = Repository.getCompany();
            const company = await companyRepo.findOneBy({
                id: reqBody.companyID
            });
            task.company = [company];
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
        const response = getDefaultResponse('Task created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const offset = (page) * limit;
        const helper = new TaskServiceHelper();

        const whereClause: FindOptionsWhere<Task> = {};

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
        const count = await taskRepo.count({
            where: { ...whereClause, organization: { id: userInfo.organization_id } }
        })
        const res = await taskRepo.find({
            where: { ...whereClause, organization: { id: userInfo.organization_id } },
            select: {
                company: {
                    id: true,
                    name: true
                },
                person: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
                owner: {
                    id: true,
                    name: true
                }
            },
            relations: {
                person: true,
                company: true,
                owner: true
            },
            skip: offset,
            take: limit
        });

        response.data = {
            count: count,
            list: res,
            stats: await helper.getTaskStats(whereClause)
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteTask = async (taskId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task deleted successfully');
        const taskRepo = Repository.getTask();
        await taskRepo.delete(taskId);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateTask = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task deleted successfully');
        const taskRepo = Repository.getTask();
        const taskId = reqBody.id;
        const task = await taskRepo.find({
            where: {
                id: taskId,
            },
            select: {
                company: {
                    id: true,
                    name: true
                },
                person: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            },
            relations: {
                person: true,
                company: true
            },
        });
        if (task == null || task.length < 1) {
            throw new Error('Task not found');
        }
        const singleTask = task[0];
        singleTask.title = reqBody.title;
        singleTask.description = reqBody.description;
        // singleTask.owner = userInfo.id as any;
        singleTask.priority = reqBody.priority;
        singleTask.dueDate = reqBody.dueDate;
        singleTask.status = reqBody.status;

        await taskRepo.save(singleTask);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}