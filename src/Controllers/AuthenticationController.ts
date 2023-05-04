import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { getUserAfterLogin } from "../Service/AuthService";

const router = express.Router();

router.get('/login/success', async (req:any , res) => {
    try {
        const response = await getUserAfterLogin(req.user);
        res.statusCode = response.statusCode;
        res.json(response);    
    } catch (error) {
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        }); 
    }
});

router.get("/login/failed", (req, res) => {
    try {
        res.status(401).json({
            error: true,
            message: "Log in failure",
        });       
    } catch (error) {
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
});

router.get(
    "/oauth2/redirect",
    passport.authenticate("google", {
        successRedirect: 'http://localhost:3000/',
        failureRedirect: "/login/failed",
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
        res.status(500).json({
            statusCode : 500,
            data : null,
            message : 'An exception occurred.',
            success : false
        });
    }
});

export default router;
