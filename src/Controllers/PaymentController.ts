import express from 'express';
import { getCustomResponse } from '../Helpers/ServiceUtils';
import { logger } from '../Config/LoggerConfig';
import { handleSuccessfulPayment } from '../Service/PaymentService';
const router = express.Router();

router.post('/success',async (req,res) => {
    try {
        const reqBody = req.body;
        const subId : string = req.query.subId as string;
        const response = await handleSuccessfulPayment(reqBody,subId);
        if(response.success === true){
            res.redirect(`${process.env.CLIENT_URL}payment/success`)
        }else{
            res.redirect(`${process.env.CLIENT_URL}failure?code=${response.statusCode}&message=${response.message}`);
        }
    } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
        res.status(500).json(getCustomResponse(null, 500, error.message, false));
    }
})

export default router;