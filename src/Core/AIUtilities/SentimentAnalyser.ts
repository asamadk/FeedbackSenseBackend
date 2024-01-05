import * as natural from 'natural';

export const AnalysisText = {
    POSITIVE: 'Positive',
    NEUTRAL: 'Neutral',
    NEGATIVE: 'Negative',
}

class SentimentAnalyser {

    private analyzer: natural.SentimentAnalyzer;
    private tokenizer: natural.TokenizerJa;

    constructor() {
        this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
        this.tokenizer = new natural.TokenizerJa();
    }

    private getContextAwareText(question: string, answer: string): string {
        return `${question},${answer}`;
    }

    public analyzeSentiment(question: string, answer: string): number {
        const contextAwareText = this.getContextAwareText(question, answer);
        const tokens = this.tokenizer.tokenize(contextAwareText);
        return this.analyzer.getSentiment(tokens);
    }

    public static getAnalysisScore() {
        const rtn = {};
        rtn[AnalysisText.POSITIVE] = 0.15; // Adjust for Positive to capture moderately positive sentiments
        rtn[AnalysisText.NEUTRAL] = 0; // Neutral can be set at zero to be the midpoint
        rtn[AnalysisText.NEGATIVE] = -0.15; // Negative for moderately negative sentiments
        return rtn;
    }

    public static getSentimentByScore(sentimentScore: number) {
        const sentimentScoreConst = this.getAnalysisScore();

        if (sentimentScore >= sentimentScoreConst[AnalysisText.POSITIVE]) {
            return AnalysisText.POSITIVE;
        } else if (sentimentScore > sentimentScoreConst[AnalysisText.NEGATIVE]) {
            return AnalysisText.NEUTRAL;
        } else {
            return AnalysisText.NEGATIVE;
        }
    }

}

export default SentimentAnalyser;
