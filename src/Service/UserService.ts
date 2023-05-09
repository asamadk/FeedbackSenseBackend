import { getDataSource } from "../Config/AppDataSource";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const getAllUsersOfSameOrg = async (userEmail: string): Promise<responseRest> => {
    const response = getDefaultResponse('Retrieved users successfully');
    const userRepository = getDataSource(false).getRepository(User);
    const user = await userRepository.findOne({
        where : {email : userEmail}
    });
    if (!user) {
        return getCustomResponse(null,401,'User not found',false);
    }
    const users = await userRepository.find({ 
        where : {
            organization_id: user.organization_id 
        }
    });
    response.data = users;
    return response;
}