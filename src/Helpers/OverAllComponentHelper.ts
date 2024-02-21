import FrequencyAnalyzer from "../Core/AIUtilities/FrequencyAnalyzer";
import SentimentAnalyser, { AnalysisText } from "../Core/AIUtilities/SentimentAnalyser";
import { TopicModeler } from "../Core/AIUtilities/TopicAnalyser";
import { getPercentage } from "./SurveyUtils";

export const processCombinedComponents = (combinedComponentMap: Map<string, any[]>, uiIdVsIdMap: Map<string, number>): Map<string, any> => {
    const returnMap = new Map<string, any>();
    for (const [key, value] of combinedComponentMap) {
        const compId: number = uiIdVsIdMap.get(key);
        returnMap.set(
            key,
            processBulkResult(compId, value)
        );
    }
    return returnMap;
}


const processBulkResult = (key: number, value: any[]): any => {
    switch (key) {
        case 1:
            return processWelcomeMessageComp(value);
        case 3:
            return processSingleSelectionComp(value);
        case 4:
            return processMultipleSelectionComp(value);
        case 5:
            return processTextAnswerComp(value);
        case 6:
            return processSmileyComp(value);
        case 7:
            return processRatingComp(value);
        case 8:
            return processNPSComp(value);
        case 11:
            return contactInfoComp(value);
        case 13:
            return dateComp(value);
        default:
            break;
    }
}

export const processWelcomeMessageComp = (data: any[]): any => {

    if (data == null) {
        return [];
    }

    const actionSet = new Set<string>();
    data?.forEach(d => {
        actionSet.add(d?.data?.click);
    });
    return {
        actions: [...actionSet],
        clickFrequency: data?.length
    }
}

export const processSingleSelectionComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    const answerFreq = new Map<string, number>();
    let question: string;
    data?.forEach(d => {
        const selectedVal = d?.data?.selectedVal;
        if (selectedVal == null) {
            return;
        }
        let val = answerFreq.get(selectedVal);
        if (val == null || Number.isNaN(val)) {
            val = 0;
        }
        val++;
        question = d?.compData?.question
        answerFreq.set(selectedVal, val);
    });

    const rtnArr = [];
    for (const [key, value] of answerFreq) {
        rtnArr.push({
            name: `${key.substring(0,10)}${key.length > 11 ? '...' : ''}`,
            Frequency: getPercentage(value, data?.length),
            fullName : key
        })
    }

    return {
        question: question,
        statsArr: rtnArr
    }
}

export const processMultipleSelectionComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    const answerFreq = new Map<string, number>();
    let question: string;
    let totalAnswerLength = 0;
    data?.forEach(d => {
        const selectedVal: string[] = d?.data?.selectedVal;
        totalAnswerLength += selectedVal.length;
        selectedVal.forEach(selVal => {
            let val = answerFreq.get(selVal);
            if (val == null || Number.isNaN(val)) {
                val = 0;
            }
            val++;
            question = d?.compData?.question
            answerFreq.set(selVal, val);
        });
    });
    const rtnArr = [];
    for (const [key, value] of answerFreq) {
        rtnArr.push({
            name: key,
            Frequency: getPercentage(value, totalAnswerLength)
        })
    }
    return {
        question: question,
        statsArr: rtnArr
    }
}

export const processTextAnswerComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    const rtn = [];
    const sentimentData = [
        { name: AnalysisText.POSITIVE, value: 0,label :  AnalysisText.POSITIVE},
        { name: AnalysisText.NEUTRAL, value: 0,label : AnalysisText.NEUTRAL },
        { name: AnalysisText.NEGATIVE, value: 0,label : AnalysisText.NEGATIVE },
    ];
    let question: string;
    const frequencyAnalyzer = new FrequencyAnalyzer();
    const sentimentAnalyser = new SentimentAnalyser();
    const frequencyMaps: Map<string, number>[] = [];
    data?.forEach(d => {
        const answer: string = d?.data?.answer;
        const sentimentScore = sentimentAnalyser.analyzeSentiment(question, answer);

        const sentimentScoreConst = SentimentAnalyser.getAnalysisScore();

        if (sentimentScore >= sentimentScoreConst[AnalysisText.POSITIVE]) {
            sentimentData.find(category => category.name === AnalysisText.POSITIVE).value++;
        } else if (sentimentScore > sentimentScoreConst[AnalysisText.NEUTRAL]) {
            sentimentData.find(category => category.name === AnalysisText.NEUTRAL).value++;
        } else {
            sentimentData.find(category => category.name === AnalysisText.NEGATIVE).value++;
        }

        const frequencyMap = frequencyAnalyzer.analyzeFrequency(answer);
        frequencyMaps.push(frequencyMap);
        question = d?.compData?.question
        rtn.push(answer);
    });

    const combinedFrequencyMaps = frequencyAnalyzer.combineFrequencyMaps(frequencyMaps);

    // const modeler = new TopicModeler(5);
    // const finalTopics = modeler.execute(rtn);

    const sentimentOverTime = transformSentimentOverTime(data);

    return {
        question: question,
        statsArr: rtn,
        sentimentData: sentimentData,
        wordCloud: combinedFrequencyMaps,
        // topicModel: finalTopics,
        overTimeSentiment: sentimentOverTime
    }
}

const transformSentimentOverTime = (responses: any[]) => {
    const sentimentCountsByPeriod = {};
    const sentimentAnalyser = new SentimentAnalyser();

    responses.forEach(response => {
        const question = response?.compData?.question;
        const date = new Date(response.createdDate);
        
        // Calculate the period based on every 5 days
        const periodStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDate() % 5);
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 4);
        const periodLabel = `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`;

        const sentimentScore = sentimentAnalyser.analyzeSentiment(question, response.data.answer);
        const sentiment = SentimentAnalyser.getSentimentByScore(sentimentScore);

        if (!sentimentCountsByPeriod[periodLabel]) {
            const tmp = {};
            tmp[AnalysisText.POSITIVE] = 0;
            tmp[AnalysisText.NEGATIVE] = 0;
            tmp[AnalysisText.NEUTRAL] = 0;
            sentimentCountsByPeriod[periodLabel] = tmp;
        }

        sentimentCountsByPeriod[periodLabel][sentiment]++;
    });

    // Sort the periods by start date
    const sortedPeriods = Object.keys(sentimentCountsByPeriod).sort((a, b) => {
        const startDateA = new Date(a.split(' - ')[0]).getTime();
        const startDateB = new Date(b.split(' - ')[0]).getTime();
        return startDateA - startDateB;
    });

    return sortedPeriods.map(periodLabel => ({
        name: periodLabel,
        ...sentimentCountsByPeriod[periodLabel]
    }));
};



export const processSmileyComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    let question: string;
    let extUns = 0;
    let uns = 0;
    let neutral = 0;
    let happy = 0;
    let extHpp = 0;
    data?.forEach(d => {
        const emojiId: string = d?.data?.emojiId;
        if (emojiId == '0') {
            extUns++;
        } else if (emojiId == '1') {
            uns++;
        } else if (emojiId == '2') {
            neutral++;
        } else if (emojiId == '3') {
            happy++;
        } else if (emojiId == '4') {
            extHpp++;
        }
        question = d?.compData?.question
    });

    return {
        question: question,
        statsArr: [
            {
                name: 'EU',
                percentage: getPercentage(extUns, data?.length),
                satisfaction: 'Extremely Unsatisfied'
            },
            {
                name: 'U',
                percentage: getPercentage(uns, data?.length),
                satisfaction: 'Unsatisfied'
            },
            {
                name: 'N',
                percentage: getPercentage(neutral, data?.length),
                satisfaction: 'Neutral'
            },
            {
                name: 'HP',
                percentage: getPercentage(happy, data?.length),
                satisfaction: 'Happy'
            },
            {
                name: 'H',
                percentage: getPercentage(extHpp, data?.length),
                satisfaction: 'Extremely Happy'
            },
        ]
    }
}

export const processRatingComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    let question: string;
    const freqMap = new Map<number, number>();
    let maxRange = 0;
    let range = 3;
    data?.forEach(d => {
        const selectedValue: number = d?.data?.value;
        const tempRange = d?.compData?.range;
        if (tempRange > maxRange) {
            maxRange = tempRange;
        }
        range = tempRange;
        if (selectedValue == null || selectedValue === 0) {
            return;
        }
        let freq = freqMap.get(selectedValue);
        if (freq == null || freq == 0) {
            freq = 0;
        }
        freq++;
        freqMap.set(selectedValue, freq);
        question = d?.compData?.question
    });
    for (let i = 1; i <= range; i++) {
        if (freqMap.has(i) === false) {
            freqMap.set(i, 0);
        }
    }
    const sortedArray = Array.from(freqMap.entries()).sort((a, b) => a[0] - b[0]);
    const sortedMap = new Map(sortedArray);
    const rtnObj = [];
    for (const [key, value] of sortedMap) {
        rtnObj.push({
            name: 'Range' + key,
            range: key,
            percentage: getPercentage(value, data?.length),
        });
    }
    return {
        question: question,
        statsArr: rtnObj
    }
}

export const processNPSComp = (data: any[]): any => {
    if (data == null || data.length < 1) {
        return [];
    }
    let question: string;
    const freqMap = new Map<number, number>();
    let promoters = 0;
    let detractors = 0;

    data?.forEach(d => {
        const selectedNps = parseInt(d?.data?.value);
        if (Number.isNaN(selectedNps) === false) {
            if (selectedNps >= 9) {
                promoters++;
            } else if (selectedNps <= 6) {
                detractors++;
            }
            let freq = freqMap.get(selectedNps);
            if (freq == null || Number.isNaN(freq)) {
                freq = 0;
            }
            freq++;
            freqMap.set(selectedNps, freq);
        }
        question = d?.compData?.question
    });

    const rtnObj = [];
    for (let i = 1; i <= 10; i++) {
        let value = freqMap.get(i);
        if (Number.isNaN(value)) {
            value = 0;
        }

        const percentageStr = getPercentage(value, data?.length);
        let percentage = parseInt(percentageStr);
        if (Number.isNaN(percentage) === true) {
            percentage = 0;
        }
        rtnObj.push({
            name: `Page${i}`,
            percentage: percentage,
            value: i.toString()
        });
    }

    const totalRespondents = data?.length;
    const promoterPercentage = (promoters / totalRespondents) * 100;
    const detractorPercentage = (detractors / totalRespondents) * 100;

    let nps = promoterPercentage - detractorPercentage;
    if (nps < 0) {
        nps = 0;
    }

    return {
        chart: rtnObj,
        nps: nps,
        question: question
    };
}

export const contactInfoComp = (data: any[]): any => {
    if (data == null) {
        return [];
    }
    let columnArr = []
    const rowArr = [];
    let count = 0;
    data?.forEach(d => {
        const contactInfo: object = d?.data;
        delete contactInfo['surveyCompleted'];
        if (count === 0) {
            columnArr = [...Object.keys(contactInfo)];
        }
        count++;
        const val = Object.values(contactInfo);
        rowArr.push(val);
    });
    return {
        contactInfoRow: rowArr,
        contactColumn: columnArr
    }
}

export const dateComp = (data: any[]): any => {
    if (data == null) {
        return [];
    }
    let question = '';
    const actionSet = new Set<string>();
    data?.forEach(d => {
        actionSet.add(d?.data?.value);
        question = d?.compData?.question
    });
    return {
        actions: [...actionSet],
        clickFrequency: data?.length,
        question: question
    }
}