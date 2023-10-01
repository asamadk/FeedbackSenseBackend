import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Plan } from "../Entity/PlanEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAllPlans = async() : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Plans fetched successfully');
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
         const planList = await planRepo.find({
            order : {
                price_cents : "DESC"
            }
         });
        response.data = planList;
        return response;        
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}