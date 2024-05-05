import { FindOptionsWhere, MoreThanOrEqual, Not } from "typeorm";
import { Repository } from "../Helpers/Repository";
import { UsageEvent } from "../Entity/UsageEvent";

export class UserEventServiceHelper {

    getStartTime(timeInterval: string) {
        if (timeInterval == null || timeInterval.length < 1) {
            timeInterval = 'last_90_days';
        }
        let startDate: Date;
        if (timeInterval === 'last_90_days') {
            startDate = new Date(Date.now() - (90 * 24 * 60 * 60 * 1000));
        } else if (timeInterval === 'last_30_days') {
            startDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        } else {
            startDate = new Date(Date.now() - (15 * 24 * 60 * 60 * 1000));
        }
        return startDate;
    }

    async getUsageSession(timeInterval: string, companyId: string, personID: string) {
        const startDate: Date = this.getStartTime(timeInterval);
        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000); // Calculate the date 10 hours ago
        const sessionRepo = Repository.getUsageSession();

        const queryBuilder = sessionRepo
            .createQueryBuilder("usage_session");


        queryBuilder.where("usage_session.startTime > :startDate AND (usage_session.endTime IS NOT NULL OR usage_session.startTime > :tenHoursAgo)")
            .setParameters({
                startDate: startDate,
                tenHoursAgo: tenHoursAgo,
            });

        if (companyId != null && companyId.length > 0) {
            queryBuilder.andWhere("usage_session.companyId = :companyId");
            queryBuilder.setParameter("companyId", companyId);
        }

        if (personID != null && personID.length > 0) {
            queryBuilder.andWhere("usage_session.personId = :personId");
            queryBuilder.setParameter("personId", personID);
        }
        return await queryBuilder.getMany();
    }

    async getEventByFrequency(timeInterval: string, companyId: string, personID: string) {
        const startDate: Date = this.getStartTime(timeInterval);
        const whereClause: FindOptionsWhere<UsageEvent> = {
            createdDate: MoreThanOrEqual(startDate)
        };

        if (companyId != null && companyId.length > 0) {
            whereClause.company = {
                id: companyId
            }
        }

        if (personID != null && personID.length > 0) {
            whereClause.person = {
                id: personID
            }
        }

        const usageEventRepo = Repository.getUsageEvent();
        const events = await usageEventRepo.find({
            where: whereClause,
            order: {
                createdDate: 'ASC'
            }
        });
        return events;
    }

}