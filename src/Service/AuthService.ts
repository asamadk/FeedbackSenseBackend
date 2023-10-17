import { User } from "../Entity/UserEntity";
import { AppDataSource } from '../Config/AppDataSource';
import { InviteData, responseRest } from "../Types/ApiTypes";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Subscription } from "../Entity/SubscriptionEntity";
import { logger } from "../Config/LoggerConfig";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateLoginEmailHtml } from "../Utils/MailUtils/MailMarkup/LoginMarkup";
import { UserProfile } from '../Types/AuthTypes'
import { AuthHelper } from "../Helpers/AuthHelper/AuthHelper";

//Being called from app.ts after successful authentication
export const handleSuccessfulLogin = async (user: UserProfile): Promise<void> => {
    try {
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        let userEntity = new User();
        const userEmail: string = user._json.email;

        if (userEmail == null || userEmail === '') {
            return;
        }
        const savedUser = await userRepository.findOneBy({
            email: userEmail
        });
        if (savedUser != null && savedUser.emailVerified === true) { return; }
        if (savedUser != null && savedUser.emailVerified === false) {
            userEntity = savedUser;
        }
        userEntity.name = user.displayName;
        userEntity.email = user?._json.email;
        userEntity.image = user?._json.picture
        userEntity.emailVerified = true;
        userEntity.oauth_provider = 'GOOGLE';
        userEntity = await userRepository.save(userEntity);

        await MailHelper.sendMail(
            {
                html: generateLoginEmailHtml(userEntity.name),
                subject: 'Welcome to FeedbackSense - Let\'s Get Started!',
                to: userEntity.email,
                from: process.env.MAIL_SENDER
            }, 'customers'
        );
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    }
}

export const getFreeSubscriptionLimit = (): string => {
    const freeSubLimit = {
        usedSurveyLimit: 0
    }
    return JSON.stringify(freeSubLimit);
}

//Being called from app.tsx to fetch user
export const getUserAfterLogin = async (user: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Login success');
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);

        if (user == null) {
            return getCustomResponse(null, 403, 'Not Authorized', false);
        }
        const userObj = await userRepository.findOneBy({
            email: user?.email,
        });
        if (userObj == null) {
            return getCustomResponse(null, 404, 'User not found', false);
        }
        if (userObj.isDeleted === true) {
            return getCustomResponse(
                null,
                404,
                'Your account has been deactivated by your Admin. Please connect with your Admin for further information.',
                false
            );
        }
        const userSubscription = subscriptionRepo.findOneByOrFail({
            organization: {
                id: userObj.organization_id
            }
        });
        if (userSubscription == null) {
            return getCustomResponse(null, 404, 'Subscription not found', false);
        }

        response.data = userObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const handleInviteUser = async (payload: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Invite accepted.');
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const decryptedPayload: InviteData = AuthHelper.getPayloadDataFromQueryParam(payload);

        const invitedById = decryptedPayload.invitedBy;
        const invitedByUser = await userRepo.findOneBy({ id: invitedById });

        if (invitedByUser == null) {
            throw new Error('Invitation link is invalid.');
        }
        const inviteeUser = await userRepo.findOneBy({ email: decryptedPayload.email });
        if (inviteeUser != null) {
            return getCustomResponse(null, 409, 'Removing resources', false);
        }

        response.message = `${invitedByUser.name} has invited you to join their team on FeedbackSense.`;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const handleCleanInvite = async (payload: string, deleteUser: boolean): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Invite accepted.');
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const decryptedPayload: InviteData = AuthHelper.getPayloadDataFromQueryParam(payload);

        const inviteeUser = await userRepo.findOneBy({ email: decryptedPayload.email });
        if (inviteeUser != null) {
            if (deleteUser === true) {
                AuthHelper.deleteUser(inviteeUser.id);
            } else {
                return getCustomResponse(null, 409, 'User already exists.', false);
            }
        }
        await AuthHelper.createInviteUser(decryptedPayload);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}