import express from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();
const clienT_URL = process.env.CLIENT_URL;

import { getUserAfterLogin, handleCleanInvite, handleInviteUser } from "../Service/AuthService";
import { getCustomResponse } from "../Helpers/ServiceUtils";
import { logger } from "../Config/LoggerConfig";
import { INVITE_QUERY_PARAM } from "../Helpers/Constants";

const router = express.Router();

router.get('/login/success', async (req: any, res) => {
    try {
        const response = await getUserAfterLogin(req.user);
        res.statusCode = response.statusCode;
        res.json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
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
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get(
    "/oauth2/redirect",
    passport.authenticate("google", {
        successRedirect: clienT_URL,
        failureRedirect: "/auth/login/failed",
        prompt: 'select_account'
    })
);

router.get(
    "/google",
    passport.authenticate(
        "google",
        ["profile", "email"],
    )
);


router.get("/logout", (req: any, res) => {
    try {
        req.logout();
        res.redirect(process.env.CLIENT_URL);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/invite', async (req, res) => {
    try {
        const response = await handleInviteUser(req.query[INVITE_QUERY_PARAM] as string)
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.post('/process/clean/invite', async (req, res) => {
    try {
        const deleteUser: boolean = req.body.deleteUser
        const response = await handleCleanInvite(req.query[INVITE_QUERY_PARAM] as string, deleteUser);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});

router.get('/microsoft',
    passport.authenticate('microsoft', { failureRedirect: '/auth/login/failed',prompt: 'select_account' }));

router.get('/microsoft/oauth2/redirect',
    passport.authenticate('microsoft', { failureRedirect: '/auth/login/failed',prompt: 'select_account' }),
    function (req, res) {
        res.redirect(clienT_URL);
    });


export default router;
