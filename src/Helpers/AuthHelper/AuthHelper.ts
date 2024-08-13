import { AppDataSource } from "../../Config/AppDataSource";
import { Survey } from "../../Entity/SurveyEntity";
import { User } from "../../Entity/UserEntity";
import { InviteData } from "../../Types/ApiTypes";
import { EncryptionHelper } from "../../Utils/CryptoHelper";
import bcrypt from 'bcryptjs';
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
        // const userRepo = AppDataSource.getDataSource().getRepository(User);
        const surveyRepo = AppDataSource.getDataSource().getRepository(Survey);

        const surveyList = await surveyRepo.findBy({ user_id: userId });
        const surveyIds: string[] = [];
        surveyList.forEach(sur => {
            surveyIds.push(sur.id)
        });

        if(surveyIds != null && surveyIds.length > 0){
            await AppDataSource.getDataSource().createQueryBuilder()
                .delete()
                .from(Survey)
                .where("id IN (:...ids)", { ids: surveyIds })
                .execute();
        }

        await AppDataSource.getDataSource().createQueryBuilder()
            .delete()
            .from(User)
            .where("id = :id", { id: userId })
            .execute();
    }

    static async createInviteUser(data: InviteData,rawPassword :string,name :string) {
        const userRepo = AppDataSource.getDataSource().getRepository(User);
        const invitedById = data.invitedBy;
        const invitedByUser = await userRepo.findOneBy({ id: invitedById });

        if (invitedByUser == null) {
            throw new Error('Invitation link is invalid.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

        let newUser = new User();
        newUser.name = name;
        newUser.email = data.email;
        newUser.image = '';
        newUser.emailVerified = false;
        newUser.isDeleted = false;
        newUser.oauth_provider = 'NONE';
        newUser.password = hashedPassword;
        newUser.organization_id = invitedByUser.organization_id;
        newUser.role = data.role;
        newUser = await userRepo.save(newUser);
    }
}