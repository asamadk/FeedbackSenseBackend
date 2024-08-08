import { In, Not } from "typeorm";
import { Repository } from "../../Helpers/Repository";
import { HealthDesign } from "../../Entity/HealthDesign";
import { Company } from "../../Entity/CompanyEntity";
import { mapOperatorToTypeORM, metricInfoType } from "./HealthScoreHelper";
import { logger } from "../../Config/LoggerConfig";
import { CompanyHistory } from "../../Entity/CompanyHistory";
import { CompanyTrigger } from "../../Triggers/CompanyTrigger";

export type configType = {
    metric: string,
    metricInfo: metricInfoType,
    good: {
        operator: string,
        value: any
    },
    poor: {
        operator: string,
        value: any
    }
}

export class HealthScoreProcessor {

    companyHistory :CompanyHistory[] = []

    async execute() {
        logger.info('Health Score Processor');
        const orgs = await Repository.getOrg().find();
        const orgIds = new Set<string>();
        for (const org of orgs) {
            orgIds.add(org.id);
        }
        const healthDesigns = await Repository.getHealthDesign().find({
            where: { organization: { id: In([...orgIds]) } },
            select: { organization: { id: true } },
            relations: { organization: true }
        });
        const orgIdHealthDesign = new Map<string, HealthDesign>();
        healthDesigns.forEach(health => {
            orgIdHealthDesign.set(health.organization.id, health);
        });

        let toUpdateCompanies: Company[] = [];
        for (const orgId of orgIdHealthDesign.keys()) {
            const healthDesign = orgIdHealthDesign.get(orgId);
            const configStr = healthDesign.config;
            if (configStr == null || configStr.length < 1) { continue; }
            const config: configType[] = JSON.parse(configStr);
            const res = await this.processHealthScore(config, orgId);
            toUpdateCompanies = [...res, ...toUpdateCompanies]
        }

        try{
            if (toUpdateCompanies.length > 0) {
                await CompanyTrigger.saveBulk(toUpdateCompanies);
            }
        }catch(error){
            logger.error(`HealthScoreProcessor :: execute :: saving-companies ${error}`);
        }

        try{
            if(this.companyHistory.length > 0){
                await Repository.getCompanyHistory().save(this.companyHistory);
            }
        }catch(error){
            logger.error(`HealthScoreProcessor :: execute :: saving-companies-history ${error}`);
        }

        this.flush();
    }

    flush(){
        this.companyHistory = [];
    }

    addHealthScoreHistory(companyId : string,score : number,orgId : string){
        const history = new CompanyHistory();
        history.companyId = companyId;
        history.fieldName = 'healthScore';
        history.actionType = 'Update';
        history.extraInfo = score.toString();
        history.organization = orgId as any;
        this.companyHistory.push(history);
    }

    async processHealthScore(config: configType[], orgId: string): Promise<Company[]> {
        const updatedCompanies: Company[] = [];

        const poorCompanies = await this.getPoorCompanies(config, orgId);
        const poorCompaniesId = new Set<string>();
        poorCompanies.forEach(poor => {
            if(poor.healthScore != 0){
                this.addHealthScoreHistory(poor.id,0,orgId);
            }
            poor.healthScore = 0;
            poorCompaniesId.add(poor.id);
            updatedCompanies.push(poor);
        });

        const goodCompanies = await this.getGoodCompanies(config, poorCompaniesId, orgId);
        const goodCompaniesId = new Set<string>();
        goodCompanies.forEach(good => {
            if(good.healthScore != 100){
                this.addHealthScoreHistory(good.id,100,orgId);
            }
            good.healthScore = 100;
            goodCompaniesId.add(good.id);
            updatedCompanies.push(good);
        });
        
        const averageCompanies = await Repository.getCompany().find({
            where: {
                organization: { id: orgId },
                id: Not(In([...goodCompaniesId, ...poorCompaniesId]))
            }
        });
        averageCompanies.forEach(average => {
            if(average.healthScore != 50){
                this.addHealthScoreHistory(average.id,50,orgId);
            }
            average.healthScore = 50;
            updatedCompanies.push(average);
        });

        return updatedCompanies;
    }

    async getPoorCompanies(config: configType[], orgId: string): Promise<Company[]> {
        let query = Repository.getCompany()
            .createQueryBuilder("company")
            .where("company.organizationId = :orgId", { orgId });

        const caseStatements = [];
        const otherConditions = [];

        config.forEach(conf => {
            const condition = mapOperatorToTypeORM(conf.poor.operator, conf.poor.value);
            if (conf.metricInfo.table === 'company') {
                // condition = condition.replace('company.column_name', `company.${conf.metricInfo.value}`);
                const caseCondition = `CASE WHEN company.${conf.metricInfo.value} ${condition} THEN '${conf.metricInfo.label} criteria satisfied' ELSE NULL END`;
                caseStatements.push(caseCondition);
                otherConditions.push(`company.${conf.metricInfo.value} ${condition}`);
            }
        });

        if (otherConditions.length > 0) {
            query = query.andWhere(`(${otherConditions.join(' OR ')})`);
        }

        if (caseStatements.length > 0) {
            query = query.addSelect(`CONCAT_WS(', ', ${caseStatements.join(', ')}) AS attributeHealthScore`);
        }

        const attr = await Repository.getCompany().
                    createQueryBuilder('company')
                    .addSelect(`CONCAT_WS(', ', ${caseStatements.join(', ')}) AS attributeHealthScore`)
                    .where("company.organizationId = :orgId", { orgId })
                    .andWhere(`(${otherConditions.join(' OR ')})`).getRawMany();

        const companyIdAttributeMap = new Map<string,string>
        attr.forEach(att => {
            companyIdAttributeMap.set(att.company_id,att.attributeHealthScore);
        });

        const companies = await query.getMany();
        companies.forEach(comp => {
            const attributeStr = companyIdAttributeMap.get(comp.id);
            if(attributeStr != null && attributeStr.length > 0){
                comp.attributeHealthScore = attributeStr;
            }
        });
        return companies;
    }

    async getGoodCompanies(config: configType[], ignoreCompanies: Set<string>, orgId: string): Promise<Company[]> {
        const query = Repository.getCompany()
            .createQueryBuilder('company')
            .where('company.organizationId = :orgId', { orgId })

        if (ignoreCompanies.size > 0) {
            query.andWhere('company.id NOT IN (:...companyIds)', { companyIds: Array.from(ignoreCompanies) });
        }

        config.forEach(conf => {
            const condition = mapOperatorToTypeORM(conf.good.operator, conf.good.value);
            if (conf.metricInfo.table === 'company') {
                // condition = condition.replace('company.column_name', `company.${conf.metricInfo.value}`);
                query.andWhere(`company.${conf.metricInfo.value} ${condition}`);
            }
        });

        const companies = await query.getMany();
        return companies;
    }

}