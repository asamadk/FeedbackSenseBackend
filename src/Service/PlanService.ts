import { getDataSource } from "../Config/AppDataSource";
import { Plan } from "../Entity/PlanEntity";
import { getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAllPlans = async() : Promise<responseRest> => {
    const response = getDefaultResponse('Plans fetched successfully');
    const planRepo = getDataSource(false).getRepository(Plan);
     const planList = await planRepo.find({
        order : {
            price_cents : "ASC"
        }
     });
    response.data = planList;
    return response;
}