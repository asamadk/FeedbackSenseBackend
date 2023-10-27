import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { Organization } from "../Entity/OrgEntity";
import { User } from "../Entity/UserEntity";
import { getCustomResponse, getDefaultResponse } from "../Helpers/ServiceUtils";
import { getUnAuthorizedResponse } from "../MiddleWares/AuthMiddleware";
import { responseRest } from "../Types/ApiTypes";
import { createCustomSettings } from "./CustomSettingsService";
import { Plan } from "../Entity/PlanEntity";
import { FREE_PLAN, MONTHLY_BILLING } from "../Helpers/Constants";
import { Subscription } from "../Entity/SubscriptionEntity";
import { getFreeSubscriptionLimit } from "./AuthService";
import Razorpay from "razorpay";
import { createPaymentCustomer } from "../Integrations/PaymentIntegration/RazorPayHelper";

export const createOrganizationForUser = async (user: User, reqBody: any): Promise<responseRest> => {
    try {
        const response = getDefaultResponse('Organization created successfully');
        const orgName: string = reqBody?.orgName;
        const address: any = {
            address: reqBody?.address,
            country: reqBody?.country,
            pinCode: reqBody?.pinCode
        }
        const userRepository = AppDataSource.getDataSource().getRepository(User);
        const orgRepo = AppDataSource.getDataSource().getRepository(Organization);

        if (orgName == null || orgName.length == 0) {
            return getCustomResponse([], 404, 'Organization name is not provided', false);
        }

        if (user == null) { return getUnAuthorizedResponse(); }
        const userEmail = user.email;
        if (userEmail == null) { return getUnAuthorizedResponse(); }
        const validUser = await userRepository.findOneBy({
            email: userEmail
        });
        if (validUser == null) {
            return getCustomResponse([], 404, ' The user does not exists ', false);
        }
        validUser.address = JSON.stringify(address);
        await userRepository.save(validUser);

        const orgObj = new Organization();
        if (process.env.NODE_ENV !== 'test') {
            // const customerId = await createPaymentCustomer(orgName,validUser);
            // orgObj.payment_customerId = customerId;
        }
        orgObj.name = orgName;
        await orgRepo.save(orgObj);

        validUser.organization_id = orgObj.id;
        userRepository.save(validUser);

        await createCustomSettings(orgObj.id);
        await createOrgSubscription(orgObj);
        response.data = orgObj;
        return response;
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return getCustomResponse(null, 500, error.message, false)
    }
}

const createOrgSubscription = async (org: Organization) => {
    const planRepo = AppDataSource.getDataSource().getRepository(Plan);
    const subscriptionRepo = AppDataSource.getDataSource().getRepository(Subscription);
    const planObj = await planRepo.findOneBy({
        name: FREE_PLAN
    });

    if (planObj != null) {
        const subscriptionObj = new Subscription();
        subscriptionObj.plan = planObj;
        subscriptionObj.organization = org;
        subscriptionObj.start_date = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        subscriptionObj.end_date = endDate;
        subscriptionObj.sub_limit = getFreeSubscriptionLimit();
        subscriptionObj.billing_cycle = MONTHLY_BILLING;
        await subscriptionRepo.save(subscriptionObj);
    }
}