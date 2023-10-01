import { logger } from "../Config/LoggerConfig";
import express from 'express';
import cluster from 'cluster';

export const logRequest = (req : any, res : express.Response, next) => {
    let userEmail : string = req?.user?.email;
    const workerId = cluster.isWorker ? cluster.worker.id : 'Master';
    if(req.user == null){
        userEmail = '';
    }
    logger.info(`[Worker ${workerId}] [${userEmail}] [${req.method}] ${req.originalUrl}`);
    next()
}