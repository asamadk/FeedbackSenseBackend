import express from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();
const clienT_URL = process.env.CLIENT_URL;

import { getUserAfterLogin } from "../Service/AuthService";
import { getCustomResponse } from "../Helpers/ServiceUtils";
import { logger } from "../Config/LoggerConfig";

const router = express.Router();

router.get('/login/success', async (req:any , res) => {
    try {
        const response = await getUserAfterLogin(req.user);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get("/login/failed", (req, res) => {
    try {
        logger.error(`Login failure :: ${req.query}`);
        res.status(401).json({
            error: true,
            message: "Log in failure",
        });
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get(
    "/oauth2/redirect",
    passport.authenticate("google", {
        successRedirect: clienT_URL,
        failureRedirect: "/auth/login/failed",
        prompt : 'select_account'
    })
);

router.get(
    "/google", 
    passport.authenticate(
        "google", 
        ["profile", "email"],
    )
);


router.get("/logout", (req : any , res) => {
    try {
        req.logout();
        res.redirect(process.env.CLIENT_URL);       
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

router.get('/invite',(req,res) => {
    try {
        //TODO handle user invite
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null,500,error.message,false));
    }
});

export default router;
