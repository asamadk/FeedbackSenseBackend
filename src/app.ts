import express from 'express';
import cors from 'cors';
import passport from "passport";
import cookieSession from 'cookie-session';
import dotenv from "dotenv";
import { Strategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
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
import CompanyController from './Controllers/CompanyController'
import PeopleController from './Controllers/PeopleController'
import CustomSettingsController from './Controllers/CustomSettingsController';
import TagController from './Controllers/TagController';
import TaskController from './Controllers/TaskController';
import ActivityController from './Controllers/ActivityController';
import NotesController from './Controllers/NotesController';
import UsageEventTypeController from './Controllers/UsageEventTypeController'
import UsageController from './Controllers/UsageController';

import { AppDataSource } from './Config/AppDataSource';
import { handleSuccessfulLogin } from './Service/AuthService';
import { isLoggedIn } from './MiddleWares/AuthMiddleware';
import { logRequest } from './MiddleWares/LogMiddleware';
import { globalAPILimiter } from './Config/RateLimitConfig';
import { User } from './Entity/UserEntity';
import { MasterScheduler } from './Core/MasterScheduler';

dotenv.config();

const app = express();

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

passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET_VALUE,
  identityMetadata: `https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration`,
  redirectUrl: process.env.MICROSOFT_CALLBACK_URL,
  allowHttpForRedirectUrl: true, // Set to false in production
  scope: ['user.read'],
  prompt: 'select_account',
},
  async function (accessToken: string, refreshToken: string, profile: any, done: any) {
    await handleSuccessfulLogin(null, profile, 'microsoft');
    const currentUser = await AppDataSource.getDataSource().getRepository(User).findOneOrFail({
      where: {
        email: profile._json.mail
      }
    });
    if (currentUser == null) {
      throw new Error('Unable to create user.Please contact support.');
    }
    done(null, currentUser);
  }
));


passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async function (accessToken: string, refreshToken: string, profile: any, callback: any) {
      await handleSuccessfulLogin(profile, null, 'google');
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
passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});

//This endpoint do not use JSON
app.use('/webhook', express.raw({ type: 'application/json' }), logRequest, WebhookController);

//these endpoint use JSON
app.use(express.json({ limit: '2mb' }));

//Open endpoints
app.use('/auth', logRequest, AuthController)
app.use('/live', logRequest, LiveSurveyController);
app.use('/payment', logRequest, PaymentController);
app.use('/usage',logRequest,UsageController);

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
app.use('/settings', isLoggedIn, logRequest, CustomSettingsController);
app.use('/company', isLoggedIn, logRequest, CompanyController);
app.use('/people', isLoggedIn, logRequest, PeopleController);
app.use('/tag', isLoggedIn, logRequest, TagController);
app.use('/task', isLoggedIn, logRequest, TaskController);
app.use('/activity', isLoggedIn, logRequest, ActivityController);
app.use('/notes', isLoggedIn, logRequest, NotesController);
app.use('/usage-event-type', isLoggedIn, logRequest, UsageEventTypeController);

new MasterScheduler().init();

export default app;