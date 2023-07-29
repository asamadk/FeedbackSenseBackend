import { AppDataSource } from "../Config/AppDataSource";
import { StartUp } from "../Helpers/Startup";
import { TestHelper } from "./TestUtils.ts/TestHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async() => {
    await TestHelper.instance.teardownTestDB();
});

describe('Startup script', () => {

    test('Initializing startup script', async () => {
        AppDataSource.setDataSource(TestHelper.instance.dbConnect);
        await new StartUp().startExecution();
        expect('12345678').toBe('12345678');
    });

});