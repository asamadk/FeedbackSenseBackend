import { AppDataSource } from "../../Config/AppDataSource";
import { Folder } from "../../Entity/FolderEntity";
import { Survey } from "../../Entity/SurveyEntity";
import { User } from "../../Entity/UserEntity";
import { permDeleteSurvey } from "../../Service/SurveyService";
import { InviteData } from "../../Types/ApiTypes";
import { EncryptionHelper } from "../../Utils/CryptoHelper";
import { MailHelper } from "../../Utils/MailUtils/MailHelper";
import { generateLoginEmailHtml } from "../../Utils/MailUtils/MailMarkup/LoginMarkup";
import { isGreaterThan24Hours } from "../DateTimeHelper";

export class AuthHelper {

    static getPayloadDataFromQueryParam(payload: string): InviteData {
        const decryptedPayloadStr = EncryptionHelper.decryptData(payload);
        if (decryptedPayloadStr.length < 1) { throw new Error('Invitation link is invalid or has expired.') }
        const decryptedPayload: InviteData = JSON.parse(decryptedPayloadStr);
        if (decryptedPayload.date == null || isGreaterThan24Hours(decryptedPayload.date) === true) {
            throw new Error('Invitation link has expired.');
        }
        if (decryptedPayload.email == null || decryptedPayload.email.length < 1) {
            throw new Error('Invitation link is invalid.');
        }
        return decryptedPayload;
    }

    static async deleteUser(userId: string) {
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);

        const surveyList = await surveyRepo.findBy({ user_id: userId });
        const surveyIds: string[] = [];
        surveyList.forEach(sur => {
            surveyIds.push(sur.id)
        });
        await surveyRepo.delete(surveyIds);
        await userRepo.delete(userId);
    }

    static async createInviteUser(data: InviteData) {
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const invitedById = data.invitedBy;
        const invitedByUser = await userRepo.findOneBy({ id: invitedById });

        if (invitedByUser == null) {
            throw new Error('Invitation link is invalid.');
        }

        let newUser = new User();
        newUser.name = '';
        newUser.email = data.email;
        newUser.image = '';
        newUser.emailVerified = false;
        newUser.isDeleted = false;
        newUser.oauth_provider = 'NONE';
        newUser.organization_id = invitedByUser.organization_id;
        newUser.role = data.role;
        newUser = await userRepo.save(newUser);
    }
}