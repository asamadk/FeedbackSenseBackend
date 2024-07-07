import { In } from "typeorm";
import { AppDataSource } from "../Config/AppDataSource";
import { logger } from "../Config/LoggerConfig";
import { HealthScoreProcessor, configType } from "../Core/BatchJobs/HealthScoreProcessor";
import { getAverageScore, getScoresFromResponse } from "../Core/BatchJobs/SurveyProcessorHelper";
import { SurveyScoreProcessor } from "../Core/BatchJobs/SurveyScoreProcessor";
import { SurveyResponse } from "../Entity/SurveyResponse";
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

describe('SurveyScoreProcessor Test', () => {

    // test('', async () => {

    //     const testUser = await createTestUser(AppDataSource.getDataSource());
    //     const { data } = await createOrganizationForUser(testUser, {
    //         orgName: 'FeedbackSense',
    //         address: 'Delhi',
    //         country: 'India',
    //         pinCode: '40001'
    //     });

    //     const orgId = data.id;

    //     const user = await Repository.getUser().findOne({ where: { organization_id: orgId } });
    //     AuthUserDetails.getInstance().setUserDetails(user);

    //     await createCompany({
    //         name: 'Company1',
    //         website: 'www.test.com',
    //         industry: 'Technology',
    //         status: 'Paying',
    //         owner: testUser.id,
    //         address: 'India',
    //         amount: 500000
    //     });

    //     await createCompany({
    //         name: 'Company2',
    //         website: 'www.test2.com',
    //         industry: 'Technology',
    //         status: 'Free',
    //         owner: testUser.id,
    //         address: 'India',
    //         amount: 500000
    //     });

    //     await createCompany({
    //         name: 'Company3',
    //         website: 'www.test2.com',
    //         industry: 'Technology',
    //         status: 'Churned',
    //         owner: testUser.id,
    //         address: 'India',
    //         amount: 500000
    //     });

    // });

    test("getScoresFromResponse should extract NPS and CSAT scores from response", () => {
        const response = {
            response: '[{"id":8,"data":{"value":"9"}},{"id":9,"data":{"value":"7"}}]'
        } as SurveyResponse;

        const scores = getScoresFromResponse(response);
        expect(scores.first).toBe(9);
        expect(scores.second).toBe(7);
    });

    test("getScoresFromResponse should extract average NPS and CSAT scores from response", () => {
        const response = {
            response: '[{"id":8,"data":{"value":"9"}},{"id":9,"data":{"value":"7"}}]'
        } as SurveyResponse;

        const scores = getScoresFromResponse(response);
        expect(scores.first).toBe(9);
        expect(scores.second).toBe(7);
    });

    test("getAverageScore should extract average NPS and CSAT scores from response", () => {
        const response = [{
            response: '[{"id":8,"data":{"value":"9"}},{"id":9,"data":{"value":"7"}}]'
        }] as SurveyResponse[] ;

        const scores = getAverageScore(response);
        expect(scores.first).toBe(9);
        expect(scores.second).toBe(7);
    });

    test("getAverageScore should extract average NPS and CSAT scores from multiple responses", () => {
        const response = [
            {response: '[{"id":8,"data":{"value":"11"}},{"id":9,"data":{"value":"7"}}]'},
            {response: '[{"id":8,"data":{"value":"10"}},{"id":9,"data":{"value":"7"}}]'},
            {response: '[{"id":8,"data":{"value":"11"}},{"id":9,"data":{"value":"7"}}]'},
            {response: '[{"id":8,"data":{"value":"12"}},{"id":9,"data":{"value":"7"}}]'},
        ] as SurveyResponse[] ;

        const scores = getAverageScore(response);
        expect(scores.first).toBe(11);
        expect(scores.second).toBe(7);
    });

});