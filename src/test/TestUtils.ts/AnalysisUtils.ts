import { SurveyResponse } from "../../Entity/SurveyResponse";
import { createTestSurvey } from "./SurveyTestUtils";

export const populateSurveyResponse = async (connection: any) : Promise<string> => {
    const surveyEntity = await createTestSurvey(connection);
    const surveyResponseRepo = connection.getRepository(SurveyResponse);

    const surveyResponses = [];

    const surveyResponse = new SurveyResponse();
    surveyResponse.survey_id = surveyEntity.id;
    surveyResponse.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
    surveyResponse.response = '[{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}},{"id":6,"data":{"emojiId":"4"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You f****d you","answerList":["Yes","No"],"type":"single"}}]';
    surveyResponse.userDetails = '';
    surveyResponses.push(surveyResponse);

    const surveyResponse1 = new SurveyResponse();
    surveyResponse1.survey_id = surveyEntity.id;
    surveyResponse1.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
    surveyResponse1.response = '[{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}},{"id":6,"data":{"emojiId":"4"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"data":{"type":"single","selectedVal":"No"},"compData":{"question":"You f****d you","answerList":["Yes","No"],"type":"single"}}]';
    surveyResponse1.userDetails = '';
    surveyResponses.push(surveyResponse1);

    const surveyResponse2 = new SurveyResponse();
    surveyResponse2.survey_id = surveyEntity.id;
    surveyResponse2.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
    surveyResponse2.response = '[{"id":1,"data":{"click":"next"},"compData":{"welcomeText":"Welcome to FeedbackSense","buttonText":"Next"}},{"id":6,"data":{"emojiId":"1"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You f****d you","answerList":["Yes","No"],"type":"single"}}]';
    surveyResponse2.userDetails = '';
    surveyResponses.push(surveyResponse2);

    await surveyResponseRepo.save(surveyResponses);
    return surveyEntity.id
}