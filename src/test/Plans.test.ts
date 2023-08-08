import { AppDataSource } from "../Config/AppDataSource";
import { Plan } from "../Entity/PlanEntity";
import { StartUp } from "../Helpers/Startup";
import { getAllPlans } from "../Service/PlanService";
import { TestHelper } from "./TestUtils.ts/TestHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('Basic Plan Test', () => {

    test('Get all plans',async() => {
        const planList = await getAllPlans();
        expect(planList.success).toBe(true);
        expect(planList.message).toBe('Plans fetched successfully');
        expect(planList.statusCode).toBe(200);

        const data :Plan[] = planList.data;
        expect(data.length).toBe(3);
        expect(data[0].name).toBe('Growth');
        expect(data[0].price_cents).toBe(49);

        expect(data[1].name).toBe('Starter');
        expect(data[1].price_cents).toBe(25);

        expect(data[2].name).toBe('Free');
        expect(data[2].price_cents).toBe(0);
    });

});