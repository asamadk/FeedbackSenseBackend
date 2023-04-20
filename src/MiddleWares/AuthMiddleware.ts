import { responseRest } from "../Types/ApiTypes";

export const isLoggedIn = (req, res, next) => {
    if (req.user) {
        // console.log('User ', req.user);
        next();
    } else {
        res.statusCode = 401;
        res.json(getUnAuthorizedResponse());
    }
}

export const getUnAuthorizedResponse = () : responseRest => {
    return {
        success : false,
        message : 'User is not authorized',
        data : [],
        statusCode : 401
    }
}
