import { logger } from "../Config/LoggerConfig";
import { UsageEventType } from "../Entity/UsageEventTypes";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { responseRest } from "../Types/ApiTypes";

export const createUsageEventType = async (reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Event Type created successfully');
        if(
            reqBody.name == null || reqBody.name.length < 1 ||
            reqBody.type == null || reqBody.type.length < 1
        ){
            throw new Error('Payload incorrect.');
        }
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const usageEventTypeRepo = Repository.getUsageEventType();

        const eventType = new UsageEventType();
        if(reqBody.id != null && reqBody.id.length > 0){
            eventType.id = reqBody.id;
        }

        let eventName :string = reqBody.name;
        eventName = eventName.trim()

        const sameNameEventExists = await usageEventTypeRepo.exist({
            where : {
                eventName : eventName,
                organization : {
                    id : userInfo.organization_id
                }
            }
        });

        if(sameNameEventExists){
            throw new Error('Duplicate event name.')
        }

        eventType.eventName = eventName;
        eventType.eventType = reqBody.type;
        eventType.organization = userInfo.organization_id as any;

        await usageEventTypeRepo.save(eventType);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const getUsageEventType = async (): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Event type fetched successfully');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const usageEventTypeRepo = Repository.getUsageEventType();

        response.data = await usageEventTypeRepo.find({
            where : {
                organization : {
                    id : userInfo.organization_id
                }
            },
            order : {
                eventName : 'ASC'
            }
        })
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const deleteUsageEventType = async (eventTypeId : string | null): Promise<responseRest> => {
    try {
        if(eventTypeId == null || eventTypeId.length < 1){
            throw new Error('Incorrect payload.');
        }
        const response = getDefaultResponse('Event type deleted successfully');
        const usageEventTypeRepo = Repository.getUsageEventType();
        await usageEventTypeRepo.delete(eventTypeId);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}