import express from 'express';
import cors from 'cors';
import passport from "passport";
import cookieSession from 'cookie-session';
import dotenv from "dotenv";
import { Strategy } from 'passport-google-oauth20';

import OrgController from './Controllers/OrgController';
import HomeController from './Controllers/HomeController'
import SurveyController from './Controllers/SurveyController';
import AuthController from './Controllers/AuthenticationController'
import FolderController from './Controllers/FolderController';
import UserController from './Controllers/UserController';
import SurveyTypeController from './Controllers/SurveyTypeController';
import SubscriptionController from './Controllers/SubscriptionController';
import PlanController from './Controllers/PlanController'
import LiveSurveyController from './Controllers/LiveSurveyController';
import AnalysisController from './Controllers/AnalysisController';

import { getDataSource } from './Config/AppDataSource';
import { handleSuccessfulLogin } from './Service/AuthService';
import { isLoggedIn } from './MiddleWares/AuthMiddleware';
import { StartUp } from './Helpers/Startup';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
)
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      handleSuccessfulLogin(profile);
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


app.use('/auth', AuthController)
app.use('/live', LiveSurveyController);
//TODO add auth middleware here
app.use('/home', HomeController);
app.use('/org', isLoggedIn, OrgController);
app.use('/survey', SurveyController);
app.use('/folder', FolderController);
app.use('/user', UserController);
app.use('/survey/type', SurveyTypeController);
app.use('/subscription', SubscriptionController);
app.use('/plan', PlanController);
app.use('/analysis', AnalysisController)

getDataSource(false)
  .initialize()
  .then(() => {
    console.log("Database");
    console.log("Data Source has been initialized!");
    new StartUp().startExecution();
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
  });

export default app;