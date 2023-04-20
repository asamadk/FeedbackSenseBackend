import { DataSource } from "typeorm";
import { User } from "../../Entity/UserEntity";

export const createTestUser = async(conection : DataSource) : Promise<User> => {
    const userRepository = conection.getRepository(User);
    const user = new User();
    user.name = 'Jane Smith';
    user.email = 'janesmith@example.com';
    user.emailVerified = true;
    user.oauth_provider = 'GOOGLE';
    return await userRepository.save(user);
}