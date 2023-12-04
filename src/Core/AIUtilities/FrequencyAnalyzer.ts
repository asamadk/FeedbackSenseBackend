import * as natural from 'natural';

class FrequencyAnalyzer {
    private tokenizer: natural.TokenizerJa;
    private stopwords: Set<string>;

    constructor() {
        this.tokenizer = new natural.TokenizerJa();
        this.stopwords = new Set(natural.stopwords);
    }

    private removeStopWords(tokens: string[]): string[] {
        return tokens.filter(token => !this.stopwords.has(token.toLowerCase()));
    }

    public analyzeFrequency(text: string): Map<string, number> {
        const tokens = this.tokenizer.tokenize(text);
        const filteredTokens = this.removeStopWords(tokens);

        const frequencyMap = new Map<string, number>();
        filteredTokens.forEach(token => {
            const count = frequencyMap.get(token) || 0;
            frequencyMap.set(token, count + 1);
        });

        return frequencyMap;
    }

    public combineFrequencyMaps(frequencyMaps: Map<string, number>[]): { text: string, value: number }[] {
        const combinedMap = new Map<string, number>();
    
        frequencyMaps.forEach(map => {
            map.forEach((value, key) => {
                const currentCount = combinedMap.get(key) || 0;
                combinedMap.set(key, currentCount + value);
            });
        });

        return Array.from(combinedMap, ([text, value]) => ({ text, value }));
    }    
    
}

export default FrequencyAnalyzer;
