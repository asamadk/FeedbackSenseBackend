import { getPercentage } from "./SurveyUtils";

export const processCombinedComponents = (combinedComponentMap: Map<number, any[]>): Map<number, any> => {
    const returnMap = new Map<number, any>();
    for (const [key, value] of combinedComponentMap) {
        returnMap.set(
            key,
            processBulkResult(key, value)
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
            name: key,
            freq: getPercentage(value, data?.length)
        })
    }

    return {
        question: question,
        statsArr: rtnArr
    }
}

const processMultipleSelectionComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }

    const answerFreq = new Map<string, number>();
    let question: string;
    data?.forEach(d => {
        const selectedVal: string[] = d?.data?.selectedVal;
        selectedVal.forEach(selVal => {
            let val = answerFreq.get(selVal);
            if (val == null || Number.isNaN(val)) {
                val = 0;
            }
            val++;
            question = d?.compData?.question
            answerFreq.set(selVal, val);
        })
    });

    const rtnArr = [];
    for (const [key, value] of answerFreq) {
        rtnArr.push({
            name: key,
            freq: getPercentage(value, data?.length)
        })
    }
    return {
        question: question,
        statsArr: rtnArr
    }
}

const processTextAnswerComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    const rtn = [];
    let question: string;
    data?.forEach(d => {
        const answer: string = d?.data?.answer;
        question = d?.compData?.question
        rtn.push(answer);
    });

    return {
        question: question,
        statsArr: rtn
    }
}

const processSmileyComp = (data: any[]): any => {
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

const processRatingComp = (data: any[]): any => {
    if (data == null) {
        return {};
    }
    let question: string;
    const freqMap = new Map<number, number>();
    let maxRange = 0;
    data?.forEach(d => {
        const selectedValue: number = d?.data?.value;
        const tempRange = d?.compData?.range;
        if (tempRange > maxRange) {
            maxRange = tempRange;
        }
        let freq = freqMap.get(selectedValue);
        if (freq == null || freq == 0) {
            freq = 0;
        }
        freq++;
        freqMap.set(selectedValue, freq);
        question = d?.compData?.question
    });

    const rtnObj = [];
    for (const [key, value] of freqMap) {
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

const processNPSComp = (data: any[]): any => {
    if (data == null) {
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

const contactInfoComp = (data: any[]): any => {
    if (data == null) {
        return [];
    }
    let columnArr = []
    const rowArr = [];
    let count = 0;
    data?.forEach(d => {
        const contactInfo: object = d?.data;
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

const dateComp = (data: any[]): any => {
    if (data == null) {
        return [];
    }
    let question: string;
    const actionSet = new Set<string>();
    data?.forEach(d => {
        actionSet.add(d?.data);
        question = d?.compData?.question
    });
    return {
        actions: [...actionSet],
        clickFrequency: data?.length,
        question: question
    }
}