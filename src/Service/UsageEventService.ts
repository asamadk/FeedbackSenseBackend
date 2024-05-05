import { MoreThanOrEqual } from "typeorm";
import { logger } from "../Config/LoggerConfig";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";
import { UserEventServiceHelper } from "../ServiceHelper/UserEventServiceHelper";
import { Person } from "../Entity/PersonEntity";

export const getTimeSpentOverTime = async (timeInterval: string | null, personId: string | null, companyId: string | null): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Session fetched successfully');
        if ((personId == null || personId.length < 1) && (companyId == null || companyId.length < 1)) {
            throw new Error('Payload incorrect...');
        }
        const helper = new UserEventServiceHelper();
        const sessionData = await helper.getUsageSession(timeInterval, companyId, personId);

        const timeSpentPerDate: { [date: string]: number } = {};

        for (const session of sessionData) {
            const startDate = new Date(session.startTime);
            const dateKey = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`;

            let duration = 0;
            if (session.endTime && session.startTime) {
                const endTime = new Date(session.endTime);
                duration = Math.floor(
                    (((endTime.getTime() - startDate.getTime()) / 1000) / 60) / 60
                );
            }

            if (timeSpentPerDate[dateKey]) {
                timeSpentPerDate[dateKey] += duration;
            } else {
                timeSpentPerDate[dateKey] = duration;
            }
        }

        const data = Object.keys(timeSpentPerDate).map(date => ({
            name: date,
            Time: timeSpentPerDate[date],
        }));

        data.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

        response.data = data;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getEventsOverTime = async (timeInterval: string | null, personId: string | null, companyId: string | null): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Events fetched.');
        if ((personId == null || personId.length < 1) && (companyId == null || companyId.length < 1)) {
            throw new Error('Payload incorrect...');
        }
        const helper = new UserEventServiceHelper();
        const events = await helper.getEventByFrequency(timeInterval, companyId, personId);

        response.data = events;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getTopUsagePeople = async (timeInterval: string | null, companyId: string | null): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Tags created successfully');
        if ((companyId == null || companyId.length < 1)) {
            throw new Error('Payload incorrect...');
        }
        const helper = new UserEventServiceHelper();
        const interval = helper.getStartTime(timeInterval);

        const personRepo = Repository.getPeople();
        const queryResult = await personRepo
            .createQueryBuilder()
            .select("CONCAT(p.firstName, ' ', p.lastName)", "personName")
            .addSelect("c.name", "company")
            .addSelect("COUNT(DISTINCT e.id)", "totalEvents")
            .addSelect("COUNT(DISTINCT DATE(s.startTime))", "activeDays")
            .addSelect("SUM(s.duration)", "totalTimeInAppHours")
            .from(Person, "p")
            .leftJoin("p.company", "c")
            .leftJoin("p.events", "e")
            .leftJoin("p.sessions", "s")
            .where("p.companyId = :companyId", { companyId: companyId })
            .andWhere("s.startTime > :interval", { interval: interval })    
            .groupBy("p.id, c.id")
            .orderBy("totalEvents", "DESC")
            .limit(5)
            .getRawMany();

        response.data = queryResult.map(result => ({
            personName: result.personName,
            company: result.company,
            totalEvents: parseInt(result.totalEvents),
            activeDays: parseInt(result.activeDays),
        }));

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}