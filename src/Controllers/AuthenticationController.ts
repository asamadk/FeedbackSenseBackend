import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { getUserAfterLogin } from "../Service/AuthService";

const router = express.Router();

router.get('/login/success', async (req:any , res) => {
    const response = await getUserAfterLogin(req.user);
    res.statusCode = response.statusCode;
    res.json(response);
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
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
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

export default router;
