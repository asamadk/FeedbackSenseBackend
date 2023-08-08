import { AppDataSource } from "../Config/AppDataSource";
import { User } from "../Entity/UserEntity";
import { StartUp } from "../Helpers/Startup";
import { getAllUsersOfSameOrg } from "../Service/UserService";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createCompleteUser, createUserWithOrgId } from "./TestUtils.ts/UserTestUtils";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Basic User test', () => { 

    test('Get user of same org' ,async () => {
        const firstUser = await createCompleteUser('test1@test.com');
        await createUserWithOrgId('test2@test.com',firstUser.organization_id);
        await createUserWithOrgId('test3@test.com',firstUser.organization_id);
        await createCompleteUser('test4@test.com');

        const sameOrgUsers = await getAllUsersOfSameOrg('test2@test.com');
        expect(sameOrgUsers.success).toBe(true);
        expect(sameOrgUsers.statusCode).toBe(200);
        expect(sameOrgUsers.message).toBe('Retrieved users successfully');
        
        const data :User[] = sameOrgUsers.data;
        expect(data.length).toBe(3);
        expect(data[0].email).toBe('test1@test.com');
        expect(data[1].email).toBe('test2@test.com');
        expect(data[2].email).toBe('test3@test.com');

    });

});