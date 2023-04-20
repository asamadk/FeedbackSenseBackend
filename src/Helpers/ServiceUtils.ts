import { responseRest } from "../Types/ApiTypes";

export const getDefaultResponse = (message : string) : responseRest => {
    const response : responseRest = {
        data : [],
        statusCode : 200,
        message : message,
        success : true
    }

    return response;
}

export const getCustomResponse = (data : any , statusCode : number , message : string, success : boolean) => {
    const response : responseRest = {
        data : data,
        statusCode : statusCode,
        message : message,
        success : success
    }

    return response;
}