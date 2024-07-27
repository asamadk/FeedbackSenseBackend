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
import { Repository } from "../Helpers/Repository";
import { createOrganizationForUser } from "./OrgService";
import { Organization } from "../Entity/OrgEntity";
import { Coupon } from "../Entity/CouponEntity";

//Being called from app.ts after successful authentication
export const handleSuccessfulLogin = async (user: UserProfile, microsoftUser: any, type: 'google' | 'microsoft'): Promise<void> => {
    try {
        let normalizedProfile: { email: string, name: string, image: string };
        if (type === 'google') {
            normalizedProfile = {
                email: user._json.email,
                name: user.displayName,
                image: user._json.picture
            }
        } else {
            normalizedProfile = {
                email: microsoftUser._json.mail,
                name: microsoftUser._json.displayName,
                image: ''
            }
        }

        const userRepository = AppDataSource.getDataSource().getRepository(User);
        let userEntity = new User();
        const userEmail: string = normalizedProfile.email;

        if (userEmail == null || userEmail === '') {
            return;
        }

        const savedUser = await userRepository.findOneBy({
            email: userEmail
        });

        if (savedUser == null) {
            throw new Error('User not found.')
        }

        if (savedUser != null && savedUser.emailVerified === true) { return; }
        if (savedUser != null && savedUser.emailVerified === false) {
            userEntity = savedUser;
        }
        userEntity.name = normalizedProfile.name;
        userEntity.email = normalizedProfile.email;
        userEntity.image = normalizedProfile.image;
        userEntity.emailVerified = true;
        userEntity.oauth_provider = type.toUpperCase();
        userEntity = await userRepository.save(userEntity);

        await MailHelper.sendMail(
            {
                html: generateLoginEmailHtml(userEntity.name),
                subject: 'Welcome to RetainSense - Let\'s Get Started!',
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
        if (inviteeUser?.organization_id === invitedByUser.organization_id) {
            throw new Error('The invite you are trying to use has already been accepted.');
        }

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

export const createUserApplyCoupon = async (payload: { email: string, orgName: string, coupon: string, name: string }): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Coupon Applied');
        const userRepo = Repository.getUser();
        const couponRepo = Repository.getCoupons();

        if (
            payload.email == null || payload.email.length < 1 ||
            payload.orgName == null || payload.orgName.length < 1 ||
            payload.coupon == null || payload.coupon.length < 1 ||
            payload.name == null || payload.name.length < 1
        ) {
            throw new Error('Incorrect payload.');
        }

        const emailExists = await userRepo.exist({
            where: {
                email: payload.email
            }
        });
        if (emailExists === true) {
            throw new Error('Email already exists.Please login and apply your coupon code from /Settings/Redeem');
        }

        const isCouponValid = await couponRepo.exist({
            where: {
                id: payload.coupon,
                isUsed: false
            }
        });
        if (isCouponValid === false) {
            throw new Error('Invalid coupon. Please contact support@retainsense.com for further assistance.');
        }

        //create user
        const user = new User();
        user.email = payload.email;
        user.name = payload.name;
        user.oauth_provider = 'GOOGLE';
        user.emailVerified = false;
        await userRepo.save(user);

        await MailHelper.sendMail(
            {
                html: generateLoginEmailHtml(user.name),
                subject: 'Welcome to RetainSense - Let\'s Get Started!',
                to: user.email,
                from: process.env.MAIL_SENDER
            }, 'customers'
        );
        
        //create org
        const orgPayload = {
            orgName: payload.orgName,
            address: '',
            country: '',
            pinCode: ''
        }
        const { data }: { data: Organization } = await createOrganizationForUser(user, orgPayload);
        if (data.id == null) {
            throw new Error('Something went wrong. Please contact support@retainsense.com');
        }
        const coupon = new Coupon();
        coupon.id = payload.coupon;
        coupon.isUsed = true;
        coupon.organization = data;
        await couponRepo.save(coupon);
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}