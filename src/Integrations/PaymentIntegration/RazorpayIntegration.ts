import axios from "axios";
import BaseIntegration from "../BaseIntegration";
import Razorpay from "razorpay";

export class RazorPayIntegration extends BaseIntegration {
    
    private static RAZOR_PAY_API_BASE_URL = process.env.PAYMENT_API_GATEWAY;
    private instance;

    constructor(apiKey: string, secretKey: string) {
        const endpoint = RazorPayIntegration.RAZOR_PAY_API_BASE_URL;
        super(apiKey, endpoint);

        this.instance = new Razorpay({
            key_id : apiKey,
            key_secret : secretKey
        });

        const authHeaderValue = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
        axios.defaults.headers.common['Authorization'] = `Basic ${authHeaderValue}`;
    }

    async initialize(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.endpoint}payments`);
            return response.status === 200;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    async sendData(entity: string, data: any): Promise<any> {
        try {
            const response = await axios.post(`${this.endpoint}${entity}`, data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    async fetchData(entity: string, entityId?: string): Promise<any> {
        try {
            const response = await axios.get(`${this.endpoint}${entity}${entityId ? '/' + entityId : ''}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }
}
