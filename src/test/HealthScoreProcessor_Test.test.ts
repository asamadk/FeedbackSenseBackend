import { AppDataSource } from "../Config/AppDataSource";
import { HealthScoreProcessor, configType } from "../Core/BatchJobs/HealthScoreProcessor";
import { AuthUserDetails } from "../Helpers/AuthHelper/AuthUserDetails";
import { Repository } from "../Helpers/Repository";
import { StartUp } from "../Helpers/Startup";
import { createCompany } from "../Service/CompanyService";
import { createOrganizationForUser } from "../Service/OrgService";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { createTestUser } from "./TestUtils.ts/UserTestUtils";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('HealthScoreProcessor Tests', () => {

    test("Good Companies - Contract Status Equals Paying", async () => {

        const testUser = await createTestUser(AppDataSource.getDataSource());
        const { data } = await createOrganizationForUser(testUser, {
            orgName: 'FeedbackSense',
            address: 'Delhi',
            country: 'India',
            pinCode: '40001'
        });

        const orgId = data.id;

        const user = await Repository.getUser().findOne({ where: { organization_id: orgId } });
        AuthUserDetails.getInstance().setUserDetails(user);

        await createCompany({
            name: 'Company1',
            website: 'www.test.com',
            industry: 'Technology',
            status: 'Paying',
            owner: testUser.id,
            address: 'India',
            amount: 500000
        });

        await createCompany({
            name: 'Company2',
            website: 'www.test2.com',
            industry: 'Technology',
            status: 'Free',
            owner: testUser.id,
            address: 'India',
            amount: 500000
        });

        await createCompany({
            name: 'Company3',
            website: 'www.test2.com',
            industry: 'Technology',
            status: 'Churned',
            owner: testUser.id,
            address: 'India',
            amount: 500000
        });

        const config: configType[] = [
            {
                metric: "contractStatus",
                metricInfo: {
                    label: "Contract Status",
                    value: "contractStatus",
                    type: "options",
                    table: "company",
                    relation: false,
                    path: ""
                },
                good: { operator: "equals", value: "Paying" },
                poor: { operator: "equals", value: "Churned" },
            },
        ];

        const result = await new HealthScoreProcessor().processHealthScore(config, orgId);
        expect(result[0].healthScore).toBe(0);
        expect(result[1].healthScore).toBe(100);
        expect(result[2].healthScore).toBe(50);
    });

    test("Good Companies - NPS Score Greater Than 70", async () => {
        const companies = await Repository.getCompany().find();
        companies[0].npsScore = 71;
        companies[1].npsScore = 50;
        companies[2].npsScore = 19;

        const [saved, orgs] = await Promise.all([
            await Repository.getCompany().save(companies),
            await Repository.getOrg().find()
        ]);

        const config: configType[] = [
            {
                metric: "npsScore",
                metricInfo: {
                    label: "NPS Score", value: "npsScore", type: "number", table: "company",
                    relation: false,
                    path: ""
                },
                good: { operator: "greater than", value: "70" },
                poor: { operator: "less than", value: "20" },
            },
        ];
        const result = await new HealthScoreProcessor().processHealthScore(config, orgs[0].id);
        expect(result[0].healthScore).toBe(0);
        expect(result[1].healthScore).toBe(100);
        expect(result[2].healthScore).toBe(50);
    });

    test("Average Companies - Mixed Metrics", async () => {
        const companies = await Repository.getCompany().find();
        companies[0].npsScore = 50;
        companies[0].contractStatus = 'Paying';

        companies[1].npsScore = 50;
        companies[1].contractStatus = 'Churned';

        companies[2].npsScore = 19;
        companies[2].contractStatus = 'Churned';

        const [saved, orgs] = await Promise.all([
            await Repository.getCompany().save(companies),
            await Repository.getOrg().find()
        ]);

        const config: configType[] = [
            {
                metric: "contractStatus",
                metricInfo: {
                    label: "Contract Status", value: "contractStatus", type: "options", table: "company",
                    relation: false,
                    path: ""
                },
                good: { operator: "equals", value: "Paying" },
                poor: { operator: "equals", value: "Churned" },
            },
            {
                metric: "npsScore",
                metricInfo: {
                    label: "NPS Score", value: "npsScore", type: "number", table: "company",
                    relation: false,
                    path: ""
                },
                good: { operator: "greater than", value: "70" },
                poor: { operator: "less than", value: "20" },
            },
        ];
        const result = await new HealthScoreProcessor().processHealthScore(config, orgs[0].id);
        expect(result[0].healthScore).toBe(0);
        expect(result[1].healthScore).toBe(0);
        expect(result[2].healthScore).toBe(50);
    });

    test('Contract Status & Last Contact Date (Older than x days)', async () => {
        const today = new Date();

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 2);

        const olderThanThirtyDay = new Date(today);
        olderThanThirtyDay.setDate(today.getDate() - 30);

        const companies = await Repository.getCompany().find({order : {name : 'ASC'}});
        companies[0].lastContactDate = yesterday;
        companies[0].contractStatus = 'Paying';

        companies[1].lastContactDate = olderThanThirtyDay;
        companies[1].contractStatus = 'Free';

        companies[2].lastContactDate = olderThanThirtyDay;
        companies[2].contractStatus = 'Churned';

        const [saved, orgs] = await Promise.all([
            await Repository.getCompany().save(companies),
            await Repository.getOrg().find()
        ]);

        const config: configType[] = [{ "metric": "contractStatus", "metricInfo": { "label": "Contract Status", "value": "contractStatus", "type": "options", "table": "company", "relation": false, "path": "" }, "good": { "operator": "equals", "value": "Paying" }, "poor": { "operator": "not equals", "value": "Paying" } }, { "metric": "lastContactDate", "metricInfo": { "label": "Last Contact Date", "value": "lastContactDate", "type": "date", "table": "company", "relation": false, "path": "" }, "good": { "operator": "Older than X Days", "value": "1" }, "poor": { "operator": "Older than X Days", "value": "30" } }];
        const result = await new HealthScoreProcessor().processHealthScore(config, orgs[0].id);
        
        expect(result[0].healthScore).toBe(0);
        expect(result[1].healthScore).toBe(0);
        expect(result[2].healthScore).toBe(100);
    });

    test('Contract Status & Last Contact Date (Newer than x days)', async () => {
        const today = new Date();

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const olderThanThirtyDay = new Date(today);
        olderThanThirtyDay.setDate(today.getDate() - 30);

        const companies = await Repository.getCompany().find({order : {name : 'ASC'}});
        companies[0].lastContactDate = tomorrow;
        companies[0].contractStatus = 'Paying';

        companies[1].lastContactDate = today;
        companies[1].contractStatus = 'Paying';

        companies[2].lastContactDate = olderThanThirtyDay;
        companies[2].contractStatus = 'Churned';

        const [saved, orgs] = await Promise.all([
            await Repository.getCompany().save(companies),
            await Repository.getOrg().find()
        ]);

        const config: configType[] = [{"metric":"contractStatus","metricInfo":{"label":"Contract Status","value":"contractStatus","type":"options","table":"company","relation":false,"path":""},"good":{"operator":"equals","value":"Paying"},"poor":{"operator":"not equals","value":"Paying"}},{"metric":"lastContactDate","metricInfo":{"label":"Last Contact Date","value":"lastContactDate","type":"date","table":"company","relation":false,"path":""},"good":{"operator":"Newer than X Days","value":"1"},"poor":{"operator":"Older than X Days","value":"30"}}];
        const result = await new HealthScoreProcessor().processHealthScore(config, orgs[0].id);
        
        expect(result[0].healthScore).toBe(0);
        expect(result[1].healthScore).toBe(100);
        expect(result[2].healthScore).toBe(50);

        const configInList: configType[] = [{"metric":"contractStatus","metricInfo":{"label":"Contract Status","value":"contractStatus","type":"options","table":"company","relation":false,"path":""},"good":{"operator":"in list","value":"Paying"},"poor":{"operator":"not in list","value":"Paying"}},{"metric":"lastContactDate","metricInfo":{"label":"Last Contact Date","value":"lastContactDate","type":"date","table":"company","relation":false,"path":""},"good":{"operator":"Newer than X Days","value":"1"},"poor":{"operator":"Older than X Days","value":"30"}}];
        const resultInList = await new HealthScoreProcessor().processHealthScore(configInList, orgs[0].id);
        expect(resultInList[0].healthScore).toBe(0);
        expect(resultInList[1].healthScore).toBe(100);
        expect(resultInList[2].healthScore).toBe(50);

        const configContains: configType[] = [{"metric":"contractStatus","metricInfo":{"label":"Contract Status","value":"contractStatus","type":"options","table":"company","relation":false,"path":""},"good":{"operator":"contains","value":"Pay"},"poor":{"operator":"Does not contain","value":"Pay"}},{"metric":"lastContactDate","metricInfo":{"label":"Last Contact Date","value":"lastContactDate","type":"date","table":"company","relation":false,"path":""},"good":{"operator":"Newer than X Days","value":"1"},"poor":{"operator":"Older than X Days","value":"30"}}];
        const resultContains = await new HealthScoreProcessor().processHealthScore(configContains, orgs[0].id);
        expect(resultContains[0].healthScore).toBe(0);
        expect(resultContains[1].healthScore).toBe(100);
        expect(resultContains[2].healthScore).toBe(50);
    });

    test('Contract Status Empty & Last Contact Date (Newer than x days)', async () => {
        const today = new Date();

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const olderThanThirtyDay = new Date(today);
        olderThanThirtyDay.setDate(today.getDate() - 30);

        const companies = await Repository.getCompany().find({order : {name : 'ASC'}});
        companies[0].lastContactDate = tomorrow;
        companies[0].contractStatus = 'Paying';

        companies[1].lastContactDate = today;
        companies[1].contractStatus = 'Paying';

        companies[2].lastContactDate = olderThanThirtyDay;
        companies[2].contractStatus = 'Paying';

        const [saved, orgs] = await Promise.all([
            await Repository.getCompany().save(companies),
            await Repository.getOrg().find()
        ]);

        const config: configType[] = [{"metric":"contractStatus","metricInfo":{"label":"Contract Status","value":"contractStatus","type":"options","table":"company","relation":false,"path":""},"good":{"operator":"Is Not Empty","value":"Pay"},"poor":{"operator":"Is Empty","value":"Pay"}},{"metric":"lastContactDate","metricInfo":{"label":"Last Contact Date","value":"lastContactDate","type":"date","table":"company","relation":false,"path":""},"good":{"operator":"Newer than X Days","value":"1"},"poor":{"operator":"Older than X Days","value":"30"}}];
        const result = await new HealthScoreProcessor().processHealthScore(config, orgs[0].id);
        
        expect(result[0].healthScore).toBe(100);
        expect(result[1].healthScore).toBe(50);
        expect(result[2].healthScore).toBe(50);

    });

});