import crypto from 'crypto';

export class EncryptionHelper {

    static encryptData(data: string) {
        const secretKey = process.env.ENCRYPTION_KEY;
        const cipher = crypto.createCipher('aes-256-cbc', secretKey);
        const encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
        return encryptedData;
    }

    static decryptData(data: string) {
        const secretKey = process.env.ENCRYPTION_KEY;
        const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
        const decryptedData = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
        return decryptedData
    }

}