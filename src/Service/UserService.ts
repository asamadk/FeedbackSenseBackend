import { getDataSource } from "../Config/AppDataSource";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const  getAllUsersOfSameOrg = async(orgId : string) :Promise<responseRest>  => {
    const response = getDefaultResponse('Retrived users successfully');
    
    if(orgId == null || orgId.length == 0){
        return getCustomResponse([],404,' Organization Id is not present ',false);
    }

    const userRepository = getDataSource(false).getRepository(User);
    const userList = await userRepository.findBy({
        organization_id : orgId
    });

    response.data = userList;
    return response;
}