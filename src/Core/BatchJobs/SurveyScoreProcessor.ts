import { In } from "typeorm";
import { logger } from "../../Config/LoggerConfig";
import { Company } from "../../Entity/CompanyEntity";
import { Repository } from "../../Helpers/Repository";
import { SurveyResponse } from "../../Entity/SurveyResponse";
import { getAverageScore, getScoresFromResponse } from "./SurveyProcessorHelper";

export class SurveyScoreProcessor {

    async execute() {
        logger.info('Survey Score Processor');

        const companies = await Repository.getCompany().find({
            select: { organization: { id: true } },
            relations: { organization: true }
        });

        const companyIds :string[] = [];
        companies.forEach(company => companyIds.push(company.id));

        const companySurveys = new Map<string,SurveyResponse[]>();
        const surveyResponseRepo = Repository.getSurveyResponse();

        const responses = await surveyResponseRepo.find({
            where : {company : {id : In(companyIds)}},
            select : {company : {id : true}},
            order : {created_at : 'DESC'},
            relations : {company : true}
        });

        responses.forEach(response => {
            let tmp = companySurveys.get(response.company.id);
            if(tmp == null){
                tmp = [];
            }
            tmp.push(response);
            companySurveys.set(response.company.id,tmp);
        });

        const toUpdateCompanies :Company[] = [];
        for (const companyId of companySurveys.keys()) {
            const comps = await this.populateSurveyScores(companySurveys.get(companyId),companyId);
            if(comps != null){
                toUpdateCompanies.push(comps);
            }
        }

        try {
            if (toUpdateCompanies.length > 0) {
                await Repository.getCompany().save(toUpdateCompanies);
            }
        } catch (error) {
            logger.error(`SurveyScoreProcessor :: execute :: saving-companies ${error}`);
        }
    }

    async populateSurveyScores(responses: SurveyResponse[],companyId : string): Promise<Company> {
        if(responses == null || responses.length < 1){return;}
        const company = new Company();

        const latestScore = getScoresFromResponse(responses[0]);
        const avgScore = getAverageScore(responses);
        
        company.id = companyId;
        company.npsScore = latestScore.first;
        company.csatScore = latestScore.second;
        company.avgNpsScore = avgScore.first;
        company.avgCsatScore = avgScore.second;        
        return company;
    }
}