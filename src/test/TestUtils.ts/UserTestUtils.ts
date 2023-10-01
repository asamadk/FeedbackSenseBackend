import { DataSource } from "typeorm";
import { User } from "../../Entity/UserEntity";
import { AppDataSource } from "../../Config/AppDataSource";
import { createOrganizationForUser } from "../../Service/OrgService";
import { CustomSettings } from "../../Entity/CustomSettingsEntity";
import { FSCustomSetting } from "../../Utils/SettingsUtils/CustomSettingsData";

export const createTestUser = async(conection : DataSource) : Promise<User> => {
    const userRepository = conection.getRepository(User);
    const user = new User();
    user.name = 'Jane Smith';
    user.email = 'janesmith@example.com';
    user.emailVerified = true;
    user.oauth_provider = 'GOOGLE';
    user.organization_id = '1234';
    return await userRepository.save(user);
}

export const createUserWithOrgId = async (email : string , orgId : string) : Promise<User> => {
    const userRepository = AppDataSource.getDataSource().getRepository(User);
    const existingUser = await userRepository.findOneBy({email : email});
    if(existingUser != null){
        throw new Error('User already exists');
    }
    const user = new User();
    user.name = 'Jane Smith';
    user.email = email;
    user.emailVerified = true;
    user.oauth_provider = 'GOOGLE';
    user.organization_id = orgId;
    return await userRepository.save(user);
}

export const createCompleteUser = async(email : string) :Promise<User> => {
    const userRepository = AppDataSource.getDataSource().getRepository(User);
    const existingUser = await userRepository.findOneBy({email : email});
    if(existingUser != null){
        throw new Error('User already exists');
    }
    const user = new User();
    user.name = 'Jane Smith';
    user.email = email;
    user.emailVerified = true;
    user.oauth_provider = 'GOOGLE';
    await userRepository.save(user);

    await createOrganizationForUser(
        user,
        {
            orgName : 'TEST_ORG',
            address : 'TEST_ADDR',
            country : 'TEST_COUNTRY',
            pinCode : 'TEST_CODE',
        }
    );
    return await userRepository.findOne({where : {email : email}});
}

export async function createCustomSettingForOrg(organizationId: string, settingKey: string, settingValue?: string): Promise<void> {
    const customSetRepo = AppDataSource.getDataSource().getRepository(CustomSettings);

    const setting = new CustomSettings();
    setting.organizationId = organizationId;
    setting.fKey = settingKey;

    // If a setting value is provided, use it. Otherwise, fetch the default value from FSCustomSetting
    setting.fValue = settingValue || FSCustomSetting.get(settingKey);

    if (!setting.fValue) {
        throw new Error(`No default value found for setting key: ${settingKey}`);
    }

    await customSetRepo.save(setting);
}
