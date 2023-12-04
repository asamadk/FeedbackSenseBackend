import lda from '@stdlib/nlp-lda';
import * as natural from 'natural';
import { logger } from '../../Config/LoggerConfig';

export class TopicModeler {

    private numTopics: number;
    private model :any;
    private stopwords: Set<string>;
    private tokenizer: natural.TokenizerJa;
    private vocabulary : string[];

    constructor(numTopics: number) {
        this.numTopics = numTopics || 5;
        this.stopwords = new Set(natural.stopwords);
        this.tokenizer = new natural.TokenizerJa();
    }

    execute(documents: string[]){
        try {
            const preprocessedData = this.preprocess(documents);
            this.train(preprocessedData);
            return this.getTopics();    
        } catch (error) {
            logger.error(`Exception occurred in TopicAnalyser : ${error}`);
            return null;
        }
    }

    preprocess(documents: string[]) {
        this.createVocabulary(documents);
        return documents.map(doc => {
            let tokens = this.tokenizer.tokenize(doc.toLowerCase());
            tokens = tokens.filter(token => !this.stopwords.has(token));
            // Optionally: Stemming (if you decide to use stemming)
            tokens = tokens.map(token => natural.PorterStemmer.stem(token));
            return tokens.join(' ');
        });
    }

    train(documents: string[]) {
        const processedDocs = this.preprocess(documents);
        this.model = lda(processedDocs, this.numTopics);
    }

    getTopics() {
        if (!this.model || !this.model.nw || !this.vocabulary) {
            throw new Error("Model not trained or vocabulary missing");
        }
    
        const topics = [];
        const wordTopicDistributions = this.model.nw.data;
        const numWords = this.model.nw.shape[0];
        const numTopics = this.model.nw.shape[1];
    
        for (let k = 0; k < numTopics; k++) {
            const topicWords = [];
            for (let w = 0; w < numWords; w++) {
                const wordFrequency = wordTopicDistributions[w * numTopics + k];
                if (wordFrequency > 0) {
                    topicWords.push({ word: this.vocabulary[w], frequency: wordFrequency });
                }
            }
            // Sort words by frequency and take the top N words for each topic
            topicWords.sort((a, b) => b.frequency - a.frequency);
            topics.push(topicWords.slice(0, 10).map(item => item.word)); // Adjust the number '10' as needed
        }
        
        return topics.filter(topic => topic.length > 0);
        // return topics;
    }

    createVocabulary(documents : string[]) {
        const uniqueWords = new Set<string>();
    
        documents.forEach(doc => {
            let tokens = this.tokenizer.tokenize(doc.toLowerCase());
            tokens = tokens.filter(token => !this.stopwords.has(token)); // Remove stop words
            tokens.forEach(token => uniqueWords.add(token));
        });
        this.vocabulary = Array.from(uniqueWords);
    }

}
