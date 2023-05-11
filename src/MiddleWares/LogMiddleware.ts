import { logger } from "../Config/LoggerConfig";
import express from 'express';

export const logRequest = (req : any, res : express.Response, next) => {
    let userEmail : string = req?.user?._json.email;
    if(req.user == null){
        userEmail = '';
    }
    logger.info(`[${userEmail}] [${req.method}] ${req.originalUrl}`);
    next()
}