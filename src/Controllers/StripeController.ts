import express from 'express';
import dotenv from "dotenv";
import Stripe from 'stripe';
import { cancelCurrentSubscription, checkUserCurrentPlan, getCurrentPlanIdFromStrip, getCustomerId } from '../Service/StripeService';
import { logger } from '../Config/LoggerConfig';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { responseRest } from '../Types/ApiTypes';

dotenv.config();
const router = express.Router();

router.post('/api/subscribe', async (req, res) => {
    try {
        const { amount, localPlanId } = req.body;
        const userAlreadyOnThisPlan: boolean = await checkUserCurrentPlan(localPlanId)
        if (userAlreadyOnThisPlan === true) {
            res.status(500).json(getCustomResponse(null, 400, 'Your are currently on this plan', false));
            return;
        }
        if (amount === 0) {
            // const cancelResponse = await cancelCurrentSubscription();
            // res.status(cancelResponse.statusCode).json(cancelResponse);
            res.status(400).json(getCustomResponse({}, 400, 'To Downgrade subscription please contact support.', false));
            return;
        }
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
        const planId = await getCurrentPlanIdFromStrip(stripe, amount);
        const customerId: string = await getCustomerId();
        const existingSubscription = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status : 'active'
        });
        if (existingSubscription.data.length > 0) {
            // const subscriptionId = existingSubscription.data[0].id;
            // await stripe.subscriptions.update(subscriptionId, {
            //     cancel_at_period_end: false,
            //     items: [
            //         {
            //             id: existingSubscription.data[0].items.data[0].id,
            //             price: planId,
            //         },
            //     ],
            // });
            // res.status(200).json(getCustomResponse({}, 200, 'Subscription updated.', true));
            res.status(400).json(getCustomResponse({}, 400, 'To Upgrade/Downgrade subscription please contact support.', false));
            return;
        }
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}payment/success`,
            cancel_url: `${process.env.CLIENT_URL}`,
        });
        res.json({ sessionId: session.id });
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
});


// not using currently
router.post('/api/cancel', async (req, res) => {
    try {
        const response: responseRest = await cancelCurrentSubscription();
        res.status(response.statusCode).json(response);
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;
