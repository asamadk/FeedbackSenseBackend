import express from 'express';
import dotenv from "dotenv";
import { handleStripeWebHooks } from '../Service/WebhookService';
import { getStripe } from '../Config/StripeConfig';
import { logger } from '../Config/LoggerConfig';

dotenv.config();

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/stripe', async (req, res) => {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        return res.sendStatus(400);
    }
    const success = await handleStripeWebHooks(event);
    if (success === true) {
        res.send();
    } else {
        res.sendStatus(400);
    }

});

export default router;