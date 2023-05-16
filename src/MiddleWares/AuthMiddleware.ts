import { USER_UNAUTH_TEXT } from "../Helpers/Constants";
import { responseRest } from "../Types/ApiTypes";

export const isLoggedIn = (req, res, next) => {
    if (req.user && req.user._json.email) {
        next();
    } else {
        res.statusCode = 401;
        res.json(getUnAuthorizedResponse());
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
