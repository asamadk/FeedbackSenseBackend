import express from 'express';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import cron from 'node-cron';
import passport from "passport";
import cookieSession from 'cookie-session';
import dotenv from "dotenv";
import { Strategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';

import OrgController from './Controllers/OrgController';
import HomeController from './Controllers/HomeController';
import SurveyController from './Controllers/SurveyController';
import AuthController from './Controllers/AuthenticationController';
import FolderController from './Controllers/FolderController';
import UserController from './Controllers/UserController';
import SurveyTypeController from './Controllers/SurveyTypeController';
import SubscriptionController from './Controllers/SubscriptionController';
import PlanController from './Controllers/PlanController';
import LiveSurveyController from './Controllers/LiveSurveyController';
import PaymentController from './Controllers/PaymentController';
import AnalysisController from './Controllers/AnalysisController';
import WebhookController from './Controllers/WebhooksController';
import TemplateController from './Controllers/TemplateController';

import { AppDataSource, initializeDataSource } from './Config/AppDataSource';
import { handleSuccessfulLogin } from './Service/AuthService';
import { isLoggedIn } from './MiddleWares/AuthMiddleware';
import { logger } from './Config/LoggerConfig';
import { logRequest } from './MiddleWares/LogMiddleware';
import { globalAPILimiter } from './Config/RateLimitConfig';
import { User } from './Entity/UserEntity';
import { PaymentHandlerJob } from './Integrations/PaymentIntegration/PaymentHandlerJob';

dotenv.config();

const app = express();
const numCPUs = os.cpus().length;
const port = process.env.PORT;

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://www.feedbacksense.io",
    "https://app.feedbacksense.io",
    "https://staging.feedbacksense.io",
  ],
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

//authentication handler
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      await handleSuccessfulLogin(profile);
      const currentUser = await AppDataSource.getDataSource().getRepository(User).findOne({
        where: {
          email: profile?._json?.email
        }
      });
      if (currentUser == null) {
        throw new Error('Unable to create user.Please contact support.');
      }
      callback(null, currentUser);
    }
  )
);

//auth user serialization & deserialization
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
app.use('/payment', logRequest, PaymentController);

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
app.use('/template', isLoggedIn, logRequest, TemplateController);


const startServer = async () => {
  await initializeDataSource();
  //remove this
  // new PaymentHandlerJob();
  if (cluster.isPrimary && process.env.NODE_ENV === 'prod') {
    logger.info(`Primary process (master) with PID ${process.pid} is running`);
    cron.schedule('0 0 */3 * *', new PaymentHandlerJob());  // This runs the job every 3 days at 12:00 AM
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker) => {
      logger.info(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    app.listen(port, async () => {
      logger.info(`Server started.`)
      logger.info(`Express is listening at ${process.env.SERVER_URL}`);
    });
  }
}

startServer();

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at Promise : Reason - ${reason}, Promise - ${p}`);
  })
  .on('uncaughtException', error => {
    logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
  });
export default app;