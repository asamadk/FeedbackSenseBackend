import { SurveyResponse } from "../../Entity/SurveyResponse";
import { createTestSurvey } from "./SurveyTestUtils";

export const populateSurveyResponse = async (connection: any): Promise<string> => {
  const surveyEntity = await createTestSurvey(connection);
  const surveyResponseRepo = connection.getRepository(SurveyResponse);

  const surveyResponses = [];

  const surveyResponse = new SurveyResponse();
  surveyResponse.survey_id = surveyEntity.id;
  surveyResponse.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
  surveyResponse.response = '[{"id":1,"uiId" : "dndnode_363","data":{"click":"next"},"compData":{"welcomeText":"Welcome to RetainSense","buttonText":"Next"}},{"id":6,"uiId" : "dndnode_4383","data":{"emojiId":"4"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"uiId" : "dndnode_52","data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You know you","answerList":["Yes","No"],"type":"single"}}]';
  surveyResponse.userDetails = '';
  surveyResponses.push(surveyResponse);

  const surveyResponse1 = new SurveyResponse();
  surveyResponse1.survey_id = surveyEntity.id;
  surveyResponse1.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
  surveyResponse1.response = '[{"id":1,"uiId" : "dndnode_363","data":{"click":"next"},"compData":{"welcomeText":"Welcome to RetainSense","buttonText":"Next"}},{"id":6,"uiId" : "dndnode_4383","data":{"emojiId":"4"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"uiId" : "dndnode_52","data":{"type":"single","selectedVal":"No"},"compData":{"question":"You know you","answerList":["Yes","No"],"type":"single"}}]';
  surveyResponse1.userDetails = '';
  surveyResponses.push(surveyResponse1);

  const surveyResponse2 = new SurveyResponse();
  surveyResponse2.survey_id = surveyEntity.id;
  surveyResponse2.anonymousUserId = 'ananymourSurveyId' + new Date().getMilliseconds();
  surveyResponse2.response = '[{"id":1,"uiId" : "dndnode_363","data":{"click":"next"},"compData":{"welcomeText":"Welcome to RetainSense","buttonText":"Next"}},{"id":6,"uiId" : "dndnode_4383","data":{"emojiId":"1"},"compData":{"question":"How are you feeling right now ?","leftText":"Very Bad","rightText":"Good"}},{"id":3,"uiId" : "dndnode_52","data":{"type":"single","selectedVal":"Yes"},"compData":{"question":"You know you","answerList":["Yes","No"],"type":"single"}}]';
  surveyResponse2.userDetails = '';
  surveyResponses.push(surveyResponse2);

  await surveyResponseRepo.save(surveyResponses);
  return surveyEntity.id
}

export const generateMultipleAnswerDataset = (numItems: number, proportionOfOld: any) => {
  const dataset = [];
  const numOld = Math.floor(numItems * proportionOfOld);

  for (let i = 0; i < numItems; i++) {
    const selectedVal = i < numOld ? "old" : "new";
    const item = {
      "uiId": "dndnode_" + i,
      "id": i + 1,
      "data": { "type": "multiple", "selectedVal": [selectedVal] },
      "compData": {
        "question": "Multiple",
        "answerList": ["new", "old"],
        "type": "multiple",
        "existing": true
      }
    };
    dataset.push(item);
  }
  return JSON.stringify(dataset);
};

export const generateAnswerComponentDataset = (count: number, numberOfDifferentAnswers: number) => {
  const dataset = [];
  const answers = Array.from({ length: numberOfDifferentAnswers }, (_, i) => `Answer${i + 1}`);

  for (let i = 0; i < count; i++) {
    const answerIndex = i % numberOfDifferentAnswers;
    const answer = answers[answerIndex];

    const obj = {
      uiId: `dndnode_${i + 1000}`,
      id: 5,
      data: { answer: answer },
      compData: { question: 'A', existing: false },
    };

    dataset.push(obj);
  }

  return dataset;
}

export function generateSmileyDataset(count :number, emojiCounts = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 }) {
  if (count < 0) return [];
  const dataset = [];
  let remainingCount = count;
  for (const [emojiId, emojiCount] of Object.entries(emojiCounts)) {
    for (let i = 0; i < emojiCount && remainingCount > 0; i++) {
      const obj = {
        uiId: `dndnode_${count - remainingCount + 4000}`,
        id: 6,
        data: { emojiId: emojiId.toString() },
        compData: {
          question: 'Smiley scale',
          leftText: 'Least',
          rightText: 'Most',
          existing: true,
        },
      };
      dataset.push(obj);
      remainingCount--;
    }
  }
  return dataset;
}

export function formatMoney(val :number | string){
  if(val == null){return '$0';}
  if(typeof val === 'string'){
      if(val.length < 1){return '$0'}
      val = parseInt(val);
  }
  return `$${Intl.NumberFormat('en',{notation : 'compact'}).format(val)}`;
}