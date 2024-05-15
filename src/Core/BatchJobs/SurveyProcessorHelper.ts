import { SurveyResponse } from "../../Entity/SurveyResponse";
import { Pair } from "../../Utils/CustomDS/Pair";

export function getScoresFromResponse(response: SurveyResponse): Pair {
    const resStr = response.response;
    let resObj: any[] = [];
    if (resStr != null && resStr.length > 0) {
        resObj = JSON.parse(resStr);
    }

    let nps: number | null;
    let csat: number | null;

    resObj.forEach(res => {
        if (res.id === 8 || res.id === 9) {
            //NPS Component : 8
            //CSAT Component : 9
            const val: string | null = res.data.value;
            if (val != null && val.length > 0) {
                if (res.id === 8) {
                    nps = parseInt(val);
                } else {
                    csat = parseInt(val);
                }
            }
        }
    });
    return new Pair(nps, csat);
}

export function getAverageScore(responses: SurveyResponse[]): Pair {
    let totalNps = 0;
    let totalCsat = 0;
    let countNps = 0;
    let countCsat = 0;

    responses.forEach(response => {
        const scores = getScoresFromResponse(response);
        if (scores.first != null) {
            totalNps += scores.first;
            countNps++;
        }
        if (scores.second != null) {
            totalCsat += scores.second;
            countCsat++;
        }
    });

    // Calculate averages
    const averageNps = countNps > 0 ? totalNps / countNps : null;
    const averageCsat = countCsat > 0 ? totalCsat / countCsat : null;

    return new Pair(averageNps, averageCsat);
}