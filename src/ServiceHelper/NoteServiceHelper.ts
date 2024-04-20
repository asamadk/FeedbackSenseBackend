import { FindOptionsWhere, MoreThanOrEqual } from "typeorm";
import { Repository } from "../Helpers/Repository";
import { Notes } from "../Entity/Note";

export class NotesServiceHelper {

    async getNotesStats(whereClause : FindOptionsWhere<Notes>) {
        const noteRepo = Repository.getNotes();

        const queryPromises: Promise<number>[] = [];
        const currentDate = new Date();
        const last7DaysDate = new Date(currentDate);

        last7DaysDate.setDate(last7DaysDate.getDate() - 7);

        const last30DaysDate = new Date(currentDate);
        last30DaysDate.setDate(last30DaysDate.getDate() - 30);

        const last90DaysDate = new Date(currentDate);
        last90DaysDate.setDate(last90DaysDate.getDate() - 90);

        const countLast7Days = noteRepo.count({
            where: {
                ...whereClause,
                created_at: MoreThanOrEqual(last7DaysDate)
            }
        });
        queryPromises.push(countLast7Days);

        const countLast30Days = noteRepo.count({
            where: {
                ...whereClause,
                created_at: MoreThanOrEqual(last30DaysDate)
            }
        });
        queryPromises.push(countLast30Days);

        const countLast90Days = noteRepo.count({
            where: {
                ...whereClause,
                created_at: MoreThanOrEqual(last90DaysDate)
            }
        });
        queryPromises.push(countLast90Days);

        const [count7Days, count30Days, count90Days] = await Promise.all(queryPromises);
        return [
            { id: 1, count: count7Days, label: 'Last 7 Days' },
            { id: 1, count: count30Days, label: 'Last 30 Days' },
            { id: 1, count: count90Days, label: 'Last 90 Days' }
        ];

    }

}