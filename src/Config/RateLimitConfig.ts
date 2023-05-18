import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv';

dotenv.config();

export const globalAPILimiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW), // 15 minutes
	max: parseInt(process.env.RATE_LIMIT_MAX_PER_WINDOW), // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    message:
		'Too many requests from this IP, please try again after 15 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})