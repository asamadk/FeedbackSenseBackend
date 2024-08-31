import { google } from "googleapis";
import { logger } from "../Config/LoggerConfig";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getGoogleClient } from "../Integrations/IntegrationClients";
import { Repository } from "../Helpers/Repository";
import { In } from "typeorm";

export async function getGoogleAuthURL() {
    try {
        const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
        const response = getDefaultResponse('Flows fetched.');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const oAuth2Client = getGoogleClient();
        response.data = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state: userInfo.id,
            prompt: 'consent select_account'
        });
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export async function checkGoogleIntegrationStatus() {
    try {
        const response = getDefaultResponse('Status fetched.');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const allOrgUsers = await Repository.getUser().findBy({
            organization_id: userInfo.organization_id
        });
        const userId = allOrgUsers.map(org => org.id);

        const exists = await Repository.getCredentials().exist({
            where: {
                userId: In(userId)
            }
        });
        response.data = {
            exists: exists
        }
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export async function disconnectGoogleIntegration() {
    try {
        const response = getDefaultResponse('Google disconnected.');
        const userInfo = AuthUserDetails.getInstance().getUserDetails();
        const allOrgUsers = await Repository.getUser().findBy({
            organization_id: userInfo.organization_id
        });
        const userIds = allOrgUsers.map(org => org.id);
        const credentialsRepo = Repository.getCredentials()
        const credential = await credentialsRepo.find({
            where: { userId: In(userIds) }
        });
        const credentials = credential.map(c => c.id);
        await credentialsRepo.delete(credentials);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}