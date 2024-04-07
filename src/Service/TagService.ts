import { logger } from "../Config/LoggerConfig";
import { CompanyTag } from "../Entity/CompanyTagEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { TagServiceHelper } from "../ServiceHelper/TagServiceHelper";
import { responseRest } from "../Types/ApiTypes";

export const createTags = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Tags created successfully');
        const helper = new TagServiceHelper();
        if (helper.validateCreateTagPayload(reqBody) === false) {
            throw new Error('Payload incorrect.');
        }

        const companyRepo = Repository.getCompany();
        const company = await companyRepo.findOneBy({id : reqBody.companyId});

        const tagRepo = Repository.getCompanyTags();
        const existingTags = await tagRepo.find({
            where : {
                name : reqBody.name,
                organization : {
                    id : AuthUserDetails.getInstance().getUserDetails().organization_id
                }
            },
            select : {
                companies : {
                    id : true,
                }
            },
            relations : {
                companies : true
            }
        });
        if(existingTags != null && existingTags.length > 0){
            const existingTag = existingTags[0];
            existingTag.companies = [...existingTag.companies, company];
            await tagRepo.save(existingTag);
            return response;
        }
        const tag = new CompanyTag();
        tag.name = reqBody.name;
        tag.description = reqBody.description;
        tag.companies = [company];
        tag.organization = AuthUserDetails.getInstance().getUserDetails().organization_id as any;
        await tagRepo.save(tag);

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getOrgTags = async () : Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Tags fetched successfully');
        const tagRepo = Repository.getCompanyTags();
        const existingTag = await tagRepo.findBy({
            organization : {
                id : AuthUserDetails.getInstance().getUserDetails().organization_id
            }
        });
        response.data = existingTag;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}