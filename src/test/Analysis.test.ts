import { StartUp } from "../Helpers/Startup";
import { getFeedbackResponseList, getOverAllComponentsData, getOverallResponse, getSubDataResponse } from "../Service/AnalysisService";
import { SurveyResponse } from "../Entity/SurveyResponse";
import { createSurveyFlow, createTestSurvey } from "./TestUtils.ts/SurveyTestUtils";
import { generateAnswerComponentDataset, generateMultipleAnswerDataset, generateSmileyDataset, populateSurveyResponse } from "./TestUtils.ts/AnalysisUtils";
import { contactInfoComp, dateComp, processMultipleSelectionComp, processNPSComp, processRatingComp, processSingleSelectionComp, processSmileyComp, processTextAnswerComp, processWelcomeMessageComp } from "../Helpers/OverAllComponentHelper";
import { TestHelper } from "./TestUtils.ts/TestHelper";
import { AppDataSource } from "../Config/AppDataSource";
import { getTodaysDate, getTwelveMonthAgoDate } from "../Helpers/DateTimeHelper";

beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
    await new StartUp().startExecution();
    AppDataSource.setDataSource(TestHelper.instance.dbConnect);
});

afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
});

describe('OverAllAnalysis Test', () => {

    test('Test getFeedbackResponseList()', async () => {
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        const surveyResponse = await getFeedbackResponseList(surveyEntity.id);
        expect(surveyResponse.success === true);
    });

    test('Get feedback without surveyId', async () => {
        const surveyResponse = await getFeedbackResponseList(null);
        expect(surveyResponse.statusCode === 404);
        expect(surveyResponse.success === false);
    });

    test('Test Empty Overall Response', async () => {
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        const surveyResponseRepo = AppDataSource.getDataSource().getRepository(SurveyResponse);

        const overAllResponse = await getOverallResponse(surveyEntity.id,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllResponse.success === true);
        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.data == null);

        const surveyResponses = [];
        const surveyResponse1 = new SurveyResponse();
        surveyResponse1.survey_id = surveyEntity.id;
        surveyResponse1.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
        surveyResponse1.response = '[]';
        surveyResponse1.userDetails = '';

        surveyResponses.push(surveyResponse1);
        await surveyResponseRepo.save(surveyResponses);

        const overAllResponse1 = await getOverallResponse(surveyEntity.id,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllResponse1.success === true);
        expect(overAllResponse1.statusCode === 200);
        expect(overAllResponse1.data == null);

        const overAllSubResponse = await getSubDataResponse(surveyEntity.id,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllSubResponse.success === false);
        expect(overAllSubResponse.data == null);
        expect(overAllSubResponse.statusCode === 404);
        expect(overAllSubResponse.message === 'Survey flow is empty.');

    });

    test('Test OverAll Response', async () => {
        const surveyId = await populateSurveyResponse(AppDataSource.getDataSource());
        const overAllResponse = await getOverallResponse(surveyId,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllResponse.success === true);
        expect(overAllResponse.data?.Response === 3);
        expect(overAllResponse.data?.date === '5/4/2023');
    });

    test('Test sub-data overall response', async () => {
        const surveyId = await populateSurveyResponse(AppDataSource.getDataSource());
        await createSurveyFlow(AppDataSource.getDataSource(), surveyId);
        const overAllResponse = await getSubDataResponse(surveyId,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllResponse.success === true);
        expect(overAllResponse.data?.totalViews === 3);
        expect(overAllResponse.data?.completionRate === '100%');
        expect(overAllResponse.data?.lastResponse === 'Thu May 04 2023');
    });

    test('Test sub-data without survey flow', async () => {
        const surveyId = await populateSurveyResponse(AppDataSource.getDataSource());
        const overAllResponse = await getSubDataResponse(surveyId,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()});
        expect(overAllResponse.success === false);
        expect(overAllResponse.data == null);
        expect(overAllResponse.statusCode === 404);
        expect(overAllResponse.message === 'Survey flow is empty.');
    });

    test('Test overall components', async () => {
        const surveyId = await populateSurveyResponse(AppDataSource.getDataSource());
        await createSurveyFlow(AppDataSource.getDataSource(), surveyId);
        const overAllResponse = await getOverAllComponentsData(surveyId,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()},[] as any);

        const chartData: { [k: string]: any } = overAllResponse?.data?.info;
        const idMap: { [k: string]: number } = overAllResponse?.data?.idMap;

        expect(idMap['dndnode_363'] === 1);
        expect(idMap['dndnode_52'] === 3);
        expect(idMap['dndnode_4383'] === 6);

        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.success === true);
        expect(overAllResponse.message === 'OverAll component data fetched.');

        const one = 'dndnode_363';
        const three = 'dndnode_52';
        const six = 'dndnode_4383';
        expect(chartData[one] != null);
        expect(chartData[one].clickFrequency === 3);

        expect(chartData[three] != null);
        expect(chartData[three]?.length === 2);
        expect(chartData[three]?.statsArr[0].name === 'Yes');
        expect(chartData[three]?.statsArr[0].Frequency === '67');
        expect(chartData[three]?.statsArr[1].name === 'No');
        expect(chartData[three]?.statsArr[1].Frequency === '33');

        expect(chartData[six] != null);
        expect(chartData[six]?.length === 5);
        expect(chartData[six]?.statsArr[1].percentage === '33');
        expect(chartData[six]?.statsArr[4].percentage === '67');
    });

    test('Test overall component with no response', async () => {
        const surveyEntity = await createTestSurvey(AppDataSource.getDataSource());
        const overAllResponse = await getOverAllComponentsData(surveyEntity.id,{startDate : getTwelveMonthAgoDate(),endDate : getTodaysDate()},[] as any);
        expect(overAllResponse.statusCode === 200);
        expect(overAllResponse.success === true);
    })

});


describe('Test each component separately', () => {

    //1. Welcome component test
    test('Test OverAll Welcome component helper', async () => {
        const result: any[] = processWelcomeMessageComp(null);
        expect(result.length === 0);

        const dataStr = '[{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}},{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}},{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}}]';
        const res = processWelcomeMessageComp(JSON.parse(dataStr));
        expect(res != null);
        expect(res.clickFrequency === 3);
    });

    //2. Single answer component test
    test('Test overall Single selection component', async () => {
        const result = processSingleSelectionComp(null);
        expect(result.statsArr == null);
        expect(result.question == null);

        const dataStr = '[{"id":3,"data":{"type":"single","selectedVal":"No"},"compData":{"question":"You know you","answerList":[null],"type":"single"}},{"id":3,"data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You know you","answerList":[null],"type":"single"}},{"id":3,"data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You know you","answerList":[null],"type":"single"}}]';
        const res = processSingleSelectionComp(JSON.parse(dataStr));
        expect(res != null);
        expect(res.statsArr.length === 2);
        expect(res.statsArr[0].name === 'No');
        expect(res.statsArr[0].Frequency === '33');
        expect(res.statsArr[1].name === 'Yes');
        expect(res.statsArr[1].Frequency === '67');

        const emptyRes = processSingleSelectionComp([{}]);
        expect(emptyRes.question == null);
        expect(emptyRes.statsArr.length === 0);
    });

    //3. Multiple answer component test
    test('Test overall Multiple answer component',async () => {
        const result = processMultipleSelectionComp(null);
        expect(result.statsArr == null);
        expect(result.question == null);

        const dataStr = '[{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["new"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}}]'; 
        const dataResult = processMultipleSelectionComp(JSON.parse(dataStr));
        expect(dataResult.question === 'Multiple');
        expect(dataResult.statsArr.length === 2);
        expect(dataResult.statsArr[0].name === 'old');
        expect(parseInt(dataResult.statsArr[0].Frequency)).toBe(67);
        expect(dataResult.statsArr[1].name === 'new');
        expect(parseInt(dataResult.statsArr[1].Frequency)).toBe(33);

        const dataStr2 = '[{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["new"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["new"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}}]';
        const dataResult2 = processMultipleSelectionComp(JSON.parse(dataStr2));
        expect(dataResult2.question === 'Multiple');
        expect(dataResult2.statsArr.length === 2);
        expect(dataResult2.statsArr[0].name === 'old');
        expect(parseInt(dataResult2.statsArr[0].Frequency)).toBe(50);
        expect(dataResult2.statsArr[1].name === 'new');
        expect(parseInt(dataResult2.statsArr[1].Frequency)).toBe(50);

        const dataStr3 = '[{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["new"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["new","old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}}]';
        const dataResult3 = processMultipleSelectionComp(JSON.parse(dataStr3));
        expect(dataResult3.question === 'Multiple');
        expect(dataResult3.statsArr.length === 2);
        expect(dataResult3.statsArr[0].name === 'old');
        expect(parseInt(dataResult3.statsArr[0].Frequency)).toBe(60);
        expect(dataResult3.statsArr[1].name === 'new');
        expect(parseInt(dataResult3.statsArr[1].Frequency)).toBe(40)

        const dataStr4 = '[{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}},{"uiId":"dndnode_2203","id":4,"data":{"type":"multiple","selectedVal":["old"]},"compData":{"question":"Multiple","answerList":["new","old"],"type":"multiple","existing":true}}]';
        const dataResult4 = processMultipleSelectionComp(JSON.parse(dataStr4));
        expect(dataResult4.question === 'Multiple');
        expect(dataResult4.statsArr.length === 2);
        expect(dataResult4.statsArr[0].name === 'old');
        expect(parseInt(dataResult4.statsArr[0].Frequency)).toBe(100);
        expect(dataResult4.statsArr[1]).toBe(undefined);

        const dataStr5 = generateMultipleAnswerDataset(10000,0.7);
        const dataResult5 = processMultipleSelectionComp(JSON.parse(dataStr5));
        expect(dataResult5.question === 'Multiple');
        expect(dataResult5.statsArr.length === 2);
        expect(dataResult5.statsArr[0].name === 'old');
        expect(parseInt(dataResult5.statsArr[0].Frequency)).toBe(70);
        expect(dataResult5.statsArr[1].name === 'new');
        expect(parseInt(dataResult5.statsArr[1].Frequency)).toBe(30);
    });

    //4. Test Text answer component
    test('Test overall Text Answer component',async () => {
        const result = processTextAnswerComp(null);
        expect(result.statsArr == null);
        expect(result.question == null);

        const dataSet1 = generateAnswerComponentDataset(10,5);
        const dataResult1 = processTextAnswerComp(dataSet1);
        expect(dataResult1.question).toBe('A');
        expect(dataResult1.statsArr.length).toBe(10);
        
        const dataSet2 = generateAnswerComponentDataset(100000,5);
        const dataResult2 = processTextAnswerComp(dataSet2);
        expect(dataResult2.question).toBe('A');
        expect(dataResult2.statsArr.length).toBe(100000);
    });

    //5. Test smiley scale component
    test('Test smiley scale component' ,async() => {
        const result = processSmileyComp(null);
        expect(result.statsArr == null);
        expect(result.question == null);

        const dataSet1 = generateSmileyDataset(10,{
            "0" : 0,
            "1" : 4,
            "2" : 0,
            "3" : 0,
            "4" : 0,
        });
        const dataResult1 = processSmileyComp(dataSet1);
        expect(dataResult1.question).toBe('Smiley scale');
        expect(dataResult1.statsArr.length).toBe(5);
        expect(dataResult1.statsArr[0].percentage).toBe('0');
        expect(dataResult1.statsArr[1].percentage).toBe('100');
        expect(dataResult1.statsArr[2].percentage).toBe('0');
        expect(dataResult1.statsArr[3].percentage).toBe('0');
        expect(dataResult1.statsArr[4].percentage).toBe('0');

        const dataSet2 = generateSmileyDataset(10,{
            "0" : 0,
            "1" : 4,
            "2" : 4,
            "3" : 0,
            "4" : 0,
        });

        const dataResult2 = processSmileyComp(dataSet2);
        expect(dataResult2.question).toBe('Smiley scale');
        expect(dataResult2.statsArr.length).toBe(5);
        expect(dataResult2.statsArr[0].percentage).toBe('0');
        expect(dataResult2.statsArr[1].percentage).toBe('50');
        expect(dataResult2.statsArr[2].percentage).toBe('50');
        expect(dataResult2.statsArr[3].percentage).toBe('0');
        expect(dataResult2.statsArr[4].percentage).toBe('0');

        const dataSet3 = generateSmileyDataset(10,{
            "0" : 1,
            "1" : 4,
            "2" : 4,
            "3" : 0,
            "4" : 1,
        });

        const dataResult3 = processSmileyComp(dataSet3);
        expect(dataResult3.question).toBe('Smiley scale');
        expect(dataResult3.statsArr.length).toBe(5);
        expect(dataResult3.statsArr[0].percentage).toBe('10');
        expect(dataResult3.statsArr[1].percentage).toBe('40');
        expect(dataResult3.statsArr[2].percentage).toBe('40');
        expect(dataResult3.statsArr[3].percentage).toBe('0');
        expect(dataResult3.statsArr[4].percentage).toBe('10');

        const dataSet4 = generateSmileyDataset(19,{
            "0" : 1,
            "1" : 4,
            "2" : 4,
            "3" : 9,
            "4" : 1,
        });
        const dataResult4 = processSmileyComp(dataSet4);
        expect(dataResult4.question).toBe('Smiley scale');
        expect(dataResult4.statsArr.length).toBe(5);
        expect(dataResult4.statsArr[0].percentage).toBe('5');
        expect(dataResult4.statsArr[1].percentage).toBe('21');
        expect(dataResult4.statsArr[2].percentage).toBe('21');
        expect(dataResult4.statsArr[3].percentage).toBe('47');
        expect(dataResult4.statsArr[4].percentage).toBe('5');
    });

    //6. Test rating component
    test('Test rating component',async() => {
        const dataStr = '[{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":3},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":1},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":1},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":1},"uiId":"dndnode_5623"}]'; 
        const dataResult = processRatingComp(JSON.parse(dataStr));
        expect(dataResult.question).toBe('Rating scale');
        expect(dataResult.statsArr.length).toBe(6);
        expect(dataResult.statsArr[0].percentage).toBe('75');
        expect(dataResult.statsArr[1].percentage).toBe('0');
        expect(dataResult.statsArr[2].percentage).toBe('25');
        expect(dataResult.statsArr[3].percentage).toBe('0');
        expect(dataResult.statsArr[4].percentage).toBe('0');
        expect(dataResult.statsArr[5].percentage).toBe('0');
    
        const dataStr1 = '[{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":6},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":6},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":6},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{"value":6},"uiId":"dndnode_5623"}]';
        const dataResult1 = processRatingComp(JSON.parse(dataStr1));
        expect(dataResult1.statsArr.length).toBe(6);
        expect(dataResult1.statsArr[0].percentage).toBe('0');
        expect(dataResult1.statsArr[1].percentage).toBe('0');
        expect(dataResult1.statsArr[2].percentage).toBe('0');
        expect(dataResult1.statsArr[3].percentage).toBe('0');
        expect(dataResult1.statsArr[4].percentage).toBe('0');
        expect(dataResult1.statsArr[5].percentage).toBe('100');

        const dataStr2 = '[{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{},"uiId":"dndnode_5623"},{"compData":{"leftText":"Least","range":6,"rightText":"Most","question":"Rating scale","existing":false},"id":7,"data":{},"uiId":"dndnode_5623"}]';
        const dataResult2 = processRatingComp(JSON.parse(dataStr2));
        expect(dataResult2.statsArr[0].percentage).toBe('0');
        expect(dataResult2.statsArr[1].percentage).toBe('0');
        expect(dataResult2.statsArr[2].percentage).toBe('0');
        expect(dataResult2.statsArr[3].percentage).toBe('0');
        expect(dataResult2.statsArr[4].percentage).toBe('0');
        expect(dataResult2.statsArr[5].percentage).toBe('0');
    });

    //7. Test NPS component
    test('Test NPS component',async () => {
        const dataStr = '[{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":10,"data":{"value":"10"},"uiId":"dndnode_6789"}]';
        const dataResult = processNPSComp(JSON.parse(dataStr));
        expect(dataResult.question).toBe('NPS');
        expect(dataResult.nps).toBe(100);
        expect(dataResult.chart.length).toBe(10);
        expect(dataResult.chart[0].percentage).toBe(0);
        expect(dataResult.chart[1].percentage).toBe(0);
        expect(dataResult.chart[2].percentage).toBe(0);
        expect(dataResult.chart[3].percentage).toBe(0);
        expect(dataResult.chart[4].percentage).toBe(0);
        expect(dataResult.chart[5].percentage).toBe(0);
        expect(dataResult.chart[6].percentage).toBe(0);
        expect(dataResult.chart[7].percentage).toBe(0);
        expect(dataResult.chart[8].percentage).toBe(0);
        expect(dataResult.chart[9].percentage).toBe(100);

        const dataStr1 = '[{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"8"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":10,"data":{"value":"10"},"uiId":"dndnode_6789"}]';
        const dataResult1 = processNPSComp(JSON.parse(dataStr1));
        expect(dataResult1.chart[0].percentage).toBe(0);
        expect(dataResult1.chart[1].percentage).toBe(0);
        expect(dataResult1.chart[2].percentage).toBe(0);
        expect(dataResult1.chart[3].percentage).toBe(0);
        expect(dataResult1.chart[4].percentage).toBe(0);
        expect(dataResult1.chart[5].percentage).toBe(0);
        expect(dataResult1.chart[6].percentage).toBe(0);
        expect(dataResult1.chart[7].percentage).toBe(25);
        expect(dataResult1.chart[8].percentage).toBe(0);
        expect(dataResult1.chart[9].percentage).toBe(75);

        const dataStr2 = '[{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"8"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"8"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":8,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":10,"data":{"value":"10"},"uiId":"dndnode_6789"},{"compData":{"leftText":"least","existing":false,"rightText":"most","question":"NPS"},"id":10,"data":{"value":"10"},"uiId":"dndnode_6789"}]';
        const dataResult2 = processNPSComp(JSON.parse(dataStr2));
        expect(dataResult2.chart[0].percentage).toBe(0);
        expect(dataResult2.chart[1].percentage).toBe(0);
        expect(dataResult2.chart[2].percentage).toBe(0);
        expect(dataResult2.chart[3].percentage).toBe(0);
        expect(dataResult2.chart[4].percentage).toBe(0);
        expect(dataResult2.chart[5].percentage).toBe(0);
        expect(dataResult2.chart[6].percentage).toBe(0);
        expect(dataResult2.chart[7].percentage).toBe(40);
        expect(dataResult2.chart[8].percentage).toBe(0);
        expect(dataResult2.chart[9].percentage).toBe(60);

        const dataResult3 = processNPSComp([]);
        expect(dataResult3.length).toBe(0);
    });

    //8. Test Contact Form component
    test('Test Contact Form component',async () => {
        const dataResult = contactInfoComp([]);
        expect(dataResult.contactInfoRow.length).toBe(0);
        expect(dataResult.contactColumn.length).toBe(0);
        
        const dataResult1 = contactInfoComp(JSON.parse('[{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"}]'));
        expect(dataResult1.contactInfoRow[0].length).toBe(dataResult1.contactColumn.length);

        const dataResult2 = contactInfoComp(JSON.parse('[{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"25","Name":"Amar Soni","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"}]'));
        expect(dataResult2.contactInfoRow[0].length).toBe(dataResult2.contactColumn.length);
        expect(dataResult2.contactInfoRow[0].length).toBe(3);
        expect(dataResult2.contactInfoRow[1].length).toBe(3);
        expect(dataResult2.contactInfoRow[2].length).toBe(3);
        expect(dataResult2.contactInfoRow[0][0]).toBe('24');
        expect(dataResult2.contactInfoRow[0][1]).toBe('Abdul Samad');
        expect(dataResult2.contactInfoRow[0][2]).toBe('founder@feedbacksense.io');

        const dataResult3 = contactInfoComp(JSON.parse('[{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email","Gender"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"25","Name":"Amar Soni","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"}]'));
        expect(dataResult3.contactInfoRow[0].length).toBe(dataResult3.contactColumn.length);

        const dataResult4 = contactInfoComp(JSON.parse('[{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email","Gender"]},"id":11,"data":{"Age":"24","Name":"Abdul Samad","Email":"founder@feedbacksense.io"},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{},"uiId":"dndnode_7706"}]'));
        expect(dataResult4.contactInfoRow[0].length).toBe(dataResult4.contactColumn.length);
        expect(dataResult4.contactInfoRow[1].length).toBe(0);
        expect(dataResult4.contactInfoRow[2].length).toBe(0);

        const dataResult5 = contactInfoComp(JSON.parse('[{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email","Gender"]},"id":11,"data":{},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{},"uiId":"dndnode_7706"},{"compData":{"existing":false,"question":"Contact form","answerList":["Name","Age","Email"]},"id":11,"data":{},"uiId":"dndnode_7706"}]'));
        expect(dataResult5.contactInfoRow[0].length).toBe(dataResult5.contactColumn.length); 
    });

    // 9. Test Date component
    test('Test Date component',async() => {
        const dataResult = dateComp([]);
        expect(dataResult.actions.length).toBe(0);
        expect(dataResult.clickFrequency).toBe(0);
        expect(dataResult.question).toBe('');
        
        const dataResult1 = dateComp(JSON.parse('[{"compData":{"question":"Date selector","existing":false},"id":13,"data":{"value":"2023-06-26"},"uiId":"dndnode_8940"},{"compData":{"question":"Date selector","existing":false},"id":13,"data":{"value":"2023-06-29"},"uiId":"dndnode_8940"},{"compData":{"question":"Date selector","existing":false},"id":13,"data":{"value":"2023-06-28"},"uiId":"dndnode_8940"}]'));
        expect(dataResult1.actions.length).toBe(dataResult1.clickFrequency);
        expect(dataResult1.question).toBe('Date selector');
        expect(dataResult1.actions[0]).toBe('2023-06-26');
        expect(dataResult1.actions[1]).toBe('2023-06-29');
        expect(dataResult1.actions[2]).toBe('2023-06-28');

        const dataResult2 = dateComp(JSON.parse('[{"compData":{"question":"Date selector","existing":false},"id":13,"data":{"value":"2023-06-26"},"uiId":"dndnode_8940"},{"compData":{"question":"Date selector","existing":false},"id":13,"data":{},"uiId":"dndnode_8940"},{"compData":{"question":"Date selector","existing":false},"id":13,"data":{"value":"2023-06-28"},"uiId":"dndnode_8940"}]'));
        expect(dataResult2.actions.length).toBe(dataResult2.clickFrequency);
        expect(dataResult2.question).toBe('Date selector');
        expect(dataResult2.actions[0]).toBe('2023-06-26');
        expect(dataResult2.actions[1]).toBe(undefined);
        expect(dataResult2.actions[2]).toBe('2023-06-28');
    });

})