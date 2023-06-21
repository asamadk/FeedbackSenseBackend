import express from 'express';
import cors from 'cors';
import passport from "passport";
import cookieSession from 'cookie-session';
import dotenv from "dotenv";
import { Strategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';

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
import StripeController from './Controllers/StripeController';
import WebhookController from './Controllers/WebhooksController'
import schedule from 'node-schedule';

import { getDataSource } from './Config/AppDataSource';
import { handleSuccessfulLogin } from './Service/AuthService';
import { isLoggedIn } from './MiddleWares/AuthMiddleware';
import { StartUp } from './Helpers/Startup';
import { logger } from './Config/LoggerConfig';
import { logRequest } from './MiddleWares/LogMiddleware';
import { globalAPILimiter } from './Config/RateLimitConfig';
import { SubscriptionHelper } from './Helpers/SubscriptionHelper';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: ["http://localhost:3000", "https://www.feedbacksense.io","https://app.feedbacksense.io"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
}));

app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolve"],
    maxAge: 24 * 60 * 60 * 100,
  })
)
app.use(passport.initialize());
app.use(passport.session());
app.use(globalAPILimiter);
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

//This endpoint do not use JSON
app.use('/webhook', express.raw({ type: 'application/json' }), logRequest, WebhookController);


//these endpoint use JSON
app.use(express.json());
//Open endpoints
app.use('/auth', logRequest, AuthController)
app.use('/live', logRequest, LiveSurveyController);

//authenticated endpoints
app.use('/home', isLoggedIn, logRequest, HomeController);
app.use('/org', isLoggedIn, logRequest, OrgController);
app.use('/survey', isLoggedIn, logRequest, SurveyController);
app.use('/folder', isLoggedIn, logRequest, FolderController);
app.use('/user', isLoggedIn, logRequest, UserController);
app.use('/survey/type', isLoggedIn, logRequest, SurveyTypeController);
app.use('/subscription', isLoggedIn, logRequest, SubscriptionController);
app.use('/plan', isLoggedIn, logRequest, PlanController);
app.use('/analysis', isLoggedIn, logRequest, AnalysisController);
app.use('/stripe', isLoggedIn, logRequest, StripeController);

getDataSource(false)
  .initialize()
  .then(async() => {
    logger.info('Data source is initialized');
    new StartUp().startExecution();
    // await new SubscriptionHelper().init();
    // schedule.scheduleJob('*/9 * * * * *', () => {
    // schedule.scheduleJob('0 1 * * *', () => {
    //   new SubscriptionHelper().init();
    // });
  })
  .catch((error) => {
    logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
  })

app.listen(port, () => {
  logger.info(`Server started.`)
  logger.info(`Express is listening at http://localhost:${port}`);
});

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at Promise : Reason - ${reason}, Promise - ${p}`);
  })
  .on('uncaughtException', error => {
    logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
  });

export default app;