import { User } from "../Entity/UserEntity";
import { AppDataSource } from '../Config/AppDataSource';
import { responseRest } from "../Types/ApiTypes";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { Plan } from "../Entity/PlanEntity";
import { FREE_PLAN, MONTHLY_BILLING, STARTER_PLAN } from "../Helpers/Constants";
import { Subscription } from "../Entity/SubscriptionEntity";
import { logger } from "../Config/LoggerConfig";
import { MailHelper } from "../Utils/MailUtils/MailHelper";
import { generateLoginEmailHtml } from "../Utils/MailUtils/MailMarkup/LoginMarkup";

export const handleSuccessfulLogin = async (user: any): Promise<void> => {
    try {
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const planRepo = AppDataSource.getDataSource().getRepository(Plan);
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
        let userEntity = new User();
        const userEmail: string = user?._json?.email;
        if (userEmail == null || userEmail === '') {
            return;
        }
        const savedUser = await userRepository.findOneBy({
            email: userEmail
        });
        const planObj = await planRepo.findOneBy({
            name: FREE_PLAN
        });
        if (savedUser != null) { return; }
        userEntity.name = user._json?.name;
        userEntity.email = user._json?.email;
        userEntity.emailVerified = user?._json?.email_verified;
        userEntity.oauth_provider = user?.provider;
        userEntity = await userRepository.save(userEntity);
        if (planObj != null) {
            const subscObj = new Subscription();
            subscObj.user = userEntity;
            subscObj.plan = planObj;
            subscObj.start_date = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            subscObj.end_date = endDate;
            subscObj.sub_limit = getFreeSubscriptionLimit();
            subscObj.billing_cycle = MONTHLY_BILLING;
            await subscriptionRepo.save(subscObj);
        }
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

export const getUserAfterLogin = async (user: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Login success');
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);

        if (user == null) {
            return getCustomResponse(null, 403, 'Not Authorized', false);
        }
        const userObj = await userRepository.findOneBy({
            email: user?._json?.email
        });
        if (userObj == null) {
            return getCustomResponse(null, 404, 'User not found', false);
        }
        const userSubscription = subscriptionRepo.findOneByOrFail({
            user: {
                email: user?._json?.email
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