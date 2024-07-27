import express from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();
const clienT_URL = process.env.CLIENT_URL;

import { createUserApplyCoupon, getUserAfterLogin, handleCleanInvite, handleInviteUser } from "../Service/AuthService";
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
        res.set('Content-Type', 'text/html');
        res.send(Buffer.from(`
            <html lang="en"> 
                <head> 
                    <meta charset="UTF-8"> 
                    <meta name="viewport" 
                        content="width=device-width,  
                                initial-scale=1.0"> 
                    <title> 
                        Error
                    </title> 
                    <link rel="stylesheet" 
                        href="style.css"> 
                </head> 
                <style>
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box; 
                    } 
                    
                    body { 
                        font-family: Arial, sans-serif; 
                        background-color: #ffffff; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                    } 
                    
                    .error-container { 
                        text-align: center; 
                        background-color: #f6f7f9; 
                        padding: 20px; 
                        border-radius: 5px; 
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
                    } 
                    
                    h1 { 
                        font-size: 3rem; 
                        color: #8039DF; 
                    } 
                    
                    p { 
                        font-size: 0.8rem; 
                        color: #333; 
                        margin-bottom: 20px; 
                    } 
                    
                    a { 
                        text-decoration: none; 
                        background-color: #8039DF; 
                        color: #fff; 
                        padding: 10px 20px; 
                        border-radius: 3px; 
                        font-weight: bold; 
                        transition: background-color 0.3s ease; 
                    } 
                    
                    a:hover { 
                        background-color: #3D0A74; 
                    }
                </style>
                <body> 
                    <div class="error-container"> 
                        <h1>User Not Found</h1> 
                        <p> 
                            Please reach us out at support@retainsense.com 
                        </p> 
                        <a href="${process.env.CLIENT_URL}"> 
                            Go Back to Home 
                        </a> 
                    </div> 
                </body> 
                
                </html>
        `));
        // res.status(401).json({
        //     error: true,
        //     message: "Log in failure",
        // });
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
    passport.authenticate('microsoft', { failureRedirect: '/auth/login/failed', prompt: 'select_account' }));

router.get('/microsoft/oauth2/redirect',
    passport.authenticate('microsoft', { failureRedirect: '/auth/login/failed', prompt: 'select_account' }),
    function (req, res) {
        res.redirect(clienT_URL);
    });

router.post('/appsumo/init', async (req, res) => {
    try {
        const response = await createUserApplyCoupon(req.body);
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});


export default router;
