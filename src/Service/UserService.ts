import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { TEAM_SEATS } from "../Constants/CustomSettingsCont";
import { Organization } from "../Entity/OrgEntity";
import { User } from "../Entity/UserEntity";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { INVITE_QUERY_PARAM } from "../Helpers/Constants";
import { CustomSettingsHelper } from "../Helpers/CustomSettingHelper";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { InviteData, responseRest } from "../Types/ApiTypes";
import { EncryptionHelper } from "../Utils/CryptoHelper";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateInviteEmailHtml } from "../Utils/MailUtils/MailMarkup/InviteMarkup";

export const getAllUsersOfSameOrg = async (userEmail: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Retrieved users successfully');
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const user = await userRepository.findOne({
            where: { email: userEmail , isDeleted : false }
        });
        if (!user) {
            return getCustomResponse(null, 401, 'User not found', false);
        }
        const users = await userRepository.find({
            where: {
                organization_id: user.organization_id,
                isDeleted : false
            },
            order: {
                created_at: "ASC"
            }
        });
        response.data = users;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const removeUserFromOrg = async (toDeleteUserId: string): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Users removed successfully.');
        const userDetails = AuthUserDetails.getInstance().getUserDetails();
        if (userDetails.id === toDeleteUserId) {
            throw new Error('Sorry, you cannot delete your own user.');
        }
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const toUpdateUser = await userRepo.findOneBy({ id: toDeleteUserId });
        toUpdateUser.isDeleted = true;
        userRepo.save(toUpdateUser);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const updateUserRole = async (userId: string, role: 'OWNER' | 'ADMIN' | 'USER' | 'GUEST'): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('User removed successfully.');
        const userDetails = AuthUserDetails.getInstance().getUserDetails();

        if (userDetails.id === userId) {
            throw new Error('Sorry, you cannot modify your own role.');
        }

        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const toUpdateUser = await userRepo.findOneBy({ id: userId });
        toUpdateUser.role = role;
        userRepo.save(toUpdateUser);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

export const handleInviteUsers = async (email: string, role: 'OWNER' | 'ADMIN' | 'USER' | 'GUEST'): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('User invited successfully.');

        const userDetails = AuthUserDetails.getInstance().getUserDetails();
        const userRepo = AppDataSource.getDataSource().getRepository(User);

        const customSettingHelper = CustomSettingsHelper.getInstance(userDetails.organization_id);
        await customSettingHelper.initialize();

        const teamMemberSeats = parseInt(customSettingHelper.getCustomSettings(TEAM_SEATS));
        const currentOrgUsers = await userRepo.count({ where: { organization_id: userDetails.organization_id, isDeleted : false } });

        const emailList = email.split(',');

        if (currentOrgUsers + emailList.length > teamMemberSeats) {
            throw new Error('Upgrade plan for more seats.Team member limit reached.');
        }


        emailList.forEach(async email => {
            const inviteData : InviteData = {
                role: role,
                email: email,
                invitedBy: userDetails.id,
                date : new Date()
            }
            const encryptedData = EncryptionHelper.encryptData(JSON.stringify(inviteData));
            // const url = `${process.env.SERVER_URL}auth/invite?${INVITE_QUERY_PARAM}=${encryptedData}`;
            const url = `${process.env.CLIENT_URL}invite?${INVITE_QUERY_PARAM}=${encryptedData}`;
            console.log("🚀 ~ file: UserService.ts:109 ~ handleInviteUsers ~ url:", url);
            await MailHelper.sendMail(
                {
                    html: generateInviteEmailHtml(url, userDetails.name),
                    subject: 'You are invited to FeedbackSense',
                    to: email,
                    from: process.env.MAIL_SENDER
                }, 'customers'
            );
        });

        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}