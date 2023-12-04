import { SurveyResponse } from "../Entity/SurveyResponse";
import { json2csv } from 'json-2-csv';

type TransformedDataType = {
    id: string,
    question: string,
    answer: any
}

export class ExportHelper {

    getIndividualResponseCSV(surveyResponses: SurveyResponse[]): string {
        const combinedData = this.getIndividualResponseJSON(surveyResponses);
        const csvData = json2csv(combinedData);
        return csvData;
    }

    getIndividualResponseJSON(surveyResponses: SurveyResponse[]): any {
        const combinedData = [];
        surveyResponses.forEach(res => {
            const responseObj = JSON.parse(res.response)
            const transformedData = this.transformDataToReadableCSV(responseObj, res.anonymousUserId);
            combinedData.push(transformedData);
        });
        return combinedData;
    }

    transformDataToReadableCSV(responseObj: any[], anonymousUserId: string): any {
        let result = {
            id: anonymousUserId
        };
        responseObj.forEach(resObj => {
            switch (resObj.id) {
                case 1: {
                    const tmp = this.processWelcomeMessage(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 3: {
                    const tmp = this.processSingleSelectionComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 4: {
                    const tmp = this.processMultipleSelectionComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 5: {
                    const tmp = this.processTextAnswerComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 6: {
                    const tmp = this.processSmileyComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 7: {
                    const tmp = this.processRatingComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 8: {
                    const tmp = this.processNPSComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 11: {
                    const tmp = this.processContactInfoComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                case 13: {
                    const tmp = this.processDateComp(resObj);
                    result = { ...result, ...tmp };
                    break;
                }
                default:
                    break;
            }
        });
        return result;
    }

    processWelcomeMessage(data: any): any {
        const transformed: any = {};
        transformed['welcome-message'] = 'Welcome Message';
        transformed['welcome-click'] = data?.data?.click;
        return transformed;
    }

    processSingleSelectionComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['single-answer-question'] = data?.compData?.question;
        transformed['single-answer-result'] = data?.data?.selectedVal;
        return transformed;
    }

    processMultipleSelectionComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['multiple-answer-question'] = data?.compData?.question;
        transformed['multiple-answer-result'] = data?.data?.selectedVal;
        return transformed;
    }

    processTextAnswerComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['text-answer-question'] = data?.compData?.question;
        transformed['text-answer-result'] = data?.data?.answer;
        return transformed;
    }

    processSmileyComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['emoji-question'] = data?.compData?.question;
        transformed['emoji-result'] = this.getEmojiName(data?.data?.emojiId);
        return transformed;
    }

    processRatingComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['rating-question'] = data?.compData?.question;
        transformed['rating-result'] = data?.data?.value;
        return transformed;
    }

    processNPSComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['nps-question'] = data?.compData?.question;
        transformed['nps-result'] = data?.data?.value;
        return transformed;
    }

    processContactInfoComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['contact-question'] = data?.compData?.question;
        transformed['contact-result'] = JSON.stringify(data?.data != null ? data?.data : '');
        return transformed;
    }

    processDateComp(data: any): TransformedDataType {
        const transformed: any = {};
        transformed['date-question'] = data?.compData?.question;
        transformed['date-result'] = data?.data?.value;
        return transformed;
    }

    // helpers
    getEmojiName(emojiId: string): string {
        if (emojiId === '0') {
            return 'Extremely Unsatisfied';
        } else if (emojiId === '1') {
            return 'Unsatisfied';
        } else if (emojiId === '2') {
            return 'Neutral';
        } else if (emojiId === '3') {
            return 'Happy';
        } else if (emojiId === '4') {
            return 'Extremely Happy';
        }
        return 'N/A';
    }

}