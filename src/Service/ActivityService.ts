import { logger } from "../Config/LoggerConfig";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getActivities = async (
    companyId: string, personId: string, page: number, limit: number
): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Task created successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();

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
        const activityRepo = Repository.getActivity();
        const res = await activityRepo.find({
            where: { ...whereClause, organization: { id: userInfo.organization_id } },
            select: {
                person: {
                    id: true,
                    firstName: true,
                    lastName: true
                },
                owner: {
                    id: true,
                    name: true
                },
                company: {
                    id: true,
                    name: true
                }
            },
            relations: {
                person: true,
                company: true,
                owner: true
            },
            order : {
                created_at : 'DESC'
            },
            take : 500
        });

        response.data = res;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}