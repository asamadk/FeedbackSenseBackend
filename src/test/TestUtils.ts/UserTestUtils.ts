import { DataSource } from "typeorm";
import { User } from "../../Entity/UserEntity";
import { AppDataSource } from "../../Config/AppDataSource";
import { createOrganizationForUser } from "../../Service/OrgService";

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