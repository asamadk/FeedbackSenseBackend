import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { USER_ROLE_ERROR_TEXT, USER_UNAUTH_TEXT } from "../Helpers/Constants";
import { responseRest } from "../Types/ApiTypes";

export const isLoggedIn = (req: any, res: any, next: any) => {
    if (req.user && req.user.email) {
        AuthUserDetails.getInstance().setUserDetails(req.user);
        next();
    } else {
        res.statusCode = 401;
        res.json(getUnAuthorizedResponse());
    }
}

export const roleMiddleware = (...requiredRoles: ('OWNER' | 'ADMIN' | 'USER' | 'GUEST')[]) => {
    return (req: any, res: any, next: any) => {
        try {
            const userDetail = AuthUserDetails.getInstance().getUserDetails();
            if (userDetail.role && requiredRoles.includes(userDetail.role)) {
                next();
            } else {
                res.status(403).json(getRoleErrorResponse());
            }
        } catch (error) {
            res.status(400).json({ message: 'Invalid request', error });
        }
    };
};

export const getRoleErrorResponse = (): responseRest => {
    return {
        success: false,
        message: USER_ROLE_ERROR_TEXT,
        data: [],
        statusCode: 401
    }
}

export const getUnAuthorizedResponse = (): responseRest => {
    return {
        success: false,
        message: USER_UNAUTH_TEXT,
        data: [],
        statusCode: 401
    }
}
