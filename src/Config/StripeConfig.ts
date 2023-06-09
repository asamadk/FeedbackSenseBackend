import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const getStripe = () : Stripe => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
    return stripe;
}