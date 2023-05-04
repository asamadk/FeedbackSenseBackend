import { DataSource } from "typeorm";
import { StartUp } from "../Helpers/Startup";
import mockConnection from "./mockConnection";
import { getFeedbackResponseList, getOverAllComponentsData, getOverallResponse, getSubDataResponse } from "../Service/AnalysisService";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { createSurveyFlow, createTestSurvey } from "./TestUtils.ts/SurveyTestUtils";
import { populateSurveyResponse } from "./TestUtils.ts/AnalysisUtils";

let connection : DataSource ;

beforeAll(async () => {
    connection = await mockConnection.create();
    new StartUp().startExecution();
});

afterAll(async () => {
    await mockConnection.close();
});

afterEach(async () => {
    jest.useFakeTimers();
    await mockConnection.clear();
});


describe('OverAllAnalysis Test', () => {

    test('Test getFeedbackResponseList()',async () => {
        const surveyEntity = await createTestSurvey(connection);
        const surveyResponse = await getFeedbackResponseList(surveyEntity.id);
        expect(surveyResponse.success === true);
    });

    test('Get feedback without surveyId',async () => {
        const surveyResponse = await getFeedbackResponseList(null);
        expect(surveyResponse.statusCode === 404);
        expect(surveyResponse.success === false);
    });

    test('Test Empty Overall Response',async () => {
        const surveyEntity = await createTestSurvey(connection);
        const surveyResponseRepo = connection.getRepository(SurveyResponse);
        
        const overAllResponse = await getOverallResponse(surveyEntity.id);
        expect(overAllResponse.success === true);
        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.data == null);

        const surveyResponses = [];
        const surveyResponse1 = new SurveyResponse();
        surveyResponse1.survey_id = surveyEntity.id;
        surveyResponse1.anonymousUserId = 'ananymourSurveyId'+new Date().getMilliseconds();
        surveyResponse1.response = '[]';
        surveyResponse1.userDetails = '';

        surveyResponses.push(surveyResponse1);
        await surveyResponseRepo.save(surveyResponses);

        const overAllResponse1 = await getOverallResponse(surveyEntity.id);
        expect(overAllResponse1.success === true);
        expect(overAllResponse1.statusCode === 200);
        expect(overAllResponse1.data == null);

        const overAllSubResponse = await getSubDataResponse(surveyEntity.id);
        expect(overAllSubResponse.success === false);
        expect(overAllSubResponse.data == null);
        expect(overAllSubResponse.statusCode === 404);
        expect(overAllSubResponse.message === 'Survey flow is empty.');

    });

    test('Test OverAll Response',async () => {
        const surveyId = await populateSurveyResponse(connection);
        const overAllResponse = await getOverallResponse(surveyId);
        expect(overAllResponse.success === true);
        expect(overAllResponse.data?.Response === 3);
        expect(overAllResponse.data?.date === '5/4/2023');
    });

    test('Test sub-data overall response',async () => {
        const surveyId = await populateSurveyResponse(connection);
        await createSurveyFlow(connection,surveyId);
        const overAllResponse = await getSubDataResponse(surveyId);
        expect(overAllResponse.success === true);
        expect(overAllResponse.data?.totalViews === 3);
        expect(overAllResponse.data?.completionRate === '100%');
        expect(overAllResponse.data?.lastResponse === 'Thu May 04 2023');
    });

    test('Test sub-data without survey flow',async () => {
        const surveyId = await populateSurveyResponse(connection);
        const overAllResponse = await getSubDataResponse(surveyId);
        expect(overAllResponse.success === false);
        expect(overAllResponse.data == null);
        expect(overAllResponse.statusCode === 404);
        expect(overAllResponse.message === 'Survey flow is empty.');
    });

    test('Test overall components',async () => {
        const surveyId = await populateSurveyResponse(connection);
        await createSurveyFlow(connection,surveyId);
        const overAllResponse = await getOverAllComponentsData(surveyId);

        const chartData = overAllResponse.data;
        
        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.success === true);
        expect(overAllResponse.message === 'OverAll component data fetched.');

        expect(chartData['1'] != null);
        expect(chartData['1'].clickFrequency === 3);

        expect(chartData['3'] != null);
        expect(chartData['3']?.length === 2);
        expect(chartData['3'][0].name === 'No');
        expect(chartData['3'][0].freq === '33');
        expect(chartData['3'][1].name === 'Yes');
        expect(chartData['3'][1].freq === '67');


        expect(chartData['6'] != null);
        expect(chartData['6']?.length === 5);
        expect(chartData['6'][1].percentage === '33');
        expect(chartData['6'][4].percentage === '67');
    });

    test('Test overall component with no response',async () => {
        const surveyEntity = await createTestSurvey(connection);
        const overAllResponse = await getOverAllComponentsData(surveyEntity.id);
        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.success === true);
    })

});