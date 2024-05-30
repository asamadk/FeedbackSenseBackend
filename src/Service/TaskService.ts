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
        task.owner = reqBody.owner;
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
    companyId: string, personId: string, status: string, ownerId: string, page: number, limit: number
): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const offset = (page) * limit;
        const helper = new TaskServiceHelper();

        const whereClause: FindOptionsWhere<Task> = {
            organization: {
                id: userInfo.organization_id
            }
        };

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

        if (ownerId != null && ownerId.length > 0) {
            whereClause.owner = {
                id: ownerId
            }
        }

        if (status != null && status.length > 0) {
            whereClause.status = status as any
        }

        const taskRepo = Repository.getTask();
        const count = await taskRepo.count({
            where: whereClause
        })
        const res = await taskRepo.find({
            where: whereClause,
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
            take: limit,
            order : {
                status : 'DESC',
                dueDate : 'DESC'
            }
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

export const completeTask = async (data: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task deleted successfully');
        const taskRepo = Repository.getTask();
        const task = await taskRepo.findOneBy({ id: data.id });
        if (task == null) {
            throw new Error('Not found');
        }
        if (task.status === 'Completed') {
            task.status = 'Open';
        } else {
            task.status = 'Completed';
        }
        await taskRepo.save(task);
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
        singleTask.owner = reqBody.owner;
        singleTask.priority = reqBody.priority;
        singleTask.dueDate = reqBody.dueDate;
        singleTask.status = reqBody.status;

        if (reqBody.personID) {
            const personRepo = Repository.getPeople();
            const person = await personRepo.findOneBy({
                id: reqBody.personID
            });
            singleTask.person = [person];
        }

        if (reqBody.companyID) {
            const companyRepo = Repository.getCompany();
            const company = await companyRepo.findOneBy({
                id: reqBody.companyID
            });
            singleTask.company = [company];
        }

        await taskRepo.save(singleTask);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}