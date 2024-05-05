import { And, Equal, FindOptionsWhere, LessThan, MoreThan, MoreThanOrEqual, Not } from "typeorm";
import { Repository } from "../Helpers/Repository";
import { Task } from "../Entity/TaskEntity";

interface TaskStats {
    id: number;
    count: number;
    label: string;
}

export class TaskServiceHelper {

    validateCreateTaskPayload = (data: any): boolean => {
        // if(!data.name || !data.website){return false;}
        return true;
    }

    async getTaskStats(whereClause: FindOptionsWhere<Task>) {
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        whereClause = {
            ...whereClause,
            status: And(Not('Completed'), Not('Cancelled'))
        }

        const taskRepository = Repository.getTask();

        const overdueCount = await taskRepository.count({
            where: {
                ...whereClause,
                dueDate: LessThan(today)
            }
        });

        const dueTodayCount = await taskRepository.count({
            where: {
                ...whereClause,
                dueDate: Equal(today),
            }
        });

        const dueNextSevenDaysCount = await taskRepository.count({
            where: {
                ...whereClause,
                dueDate: And(MoreThan(today), LessThan(sevenDaysLater))
            }
        });

        const taskStats: TaskStats[] = [
            { id: 1, count: overdueCount, label: 'Task overdue' },
            { id: 2, count: dueTodayCount, label: 'Task due Today' },
            { id: 3, count: dueNextSevenDaysCount, label: 'Due next 7 days' }
        ];

        return taskStats;
    }

}