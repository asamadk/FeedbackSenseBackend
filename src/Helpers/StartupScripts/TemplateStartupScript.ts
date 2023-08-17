import { AppDataSource } from "../../Config/AppDataSource";
import { logger } from "../../Config/LoggerConfig";
import { Templates } from "../../Entity/TemplateEntity";

export class TemplateStartupScript {

    templateRepo = AppDataSource.getDataSource().getRepository(Templates);
    toInsertTemplateList: Templates[] = [];
    templateKey = new Set<string>();
    DELETE_KEY = 'DELETE_KEY';

    categoriesData = {
        CUSTOMER_EXPERIENCE: 'Customer Experience',
        MARKETING_INSIGHTS: 'Marketing Insights',
    }

    subCategoryData = {
        SALES_OPERATIONS: 'Sales Operation',
        CUSTOMER_SATISFACTION : 'Customer Satisfaction',
        LEAD_GENERATION: 'Lead Generation',
        MESSAGE_TESTING: 'Message testing'
    }

    async initialize() {
        logger.info('Template startup initialized.');
        await this.getAllExistingTemplates();
        this.addTemplatesToList();
        await this.saveTemplates();
    }

    async saveTemplates() {
        const finalSaveList: Templates[] = [];
        this.toInsertTemplateList.forEach(template => {
            if (template.name !== this.DELETE_KEY) {
                finalSaveList.push(template);
            }
        });
        //TODO : save finalSaveList here.
        await this.templateRepo.save(finalSaveList);
    }

    async getAllExistingTemplates() {
        const templates = await this.templateRepo.find();
        templates.forEach(template => {
            const key = `${template.name}-${template.category}-${template.subCategory}`;
            this.templateKey.add(key);
        });
    }

    addTemplatesToList() {
        this.toInsertTemplateList.push(this.getTemplateToSave(
            'Gauge price sensitivity with Van Westendorp\'s pricing questions', //Name
            this.categoriesData.CUSTOMER_EXPERIENCE,
            'Measure your customers\' post-purchase satisfaction using this 3 questions survey.', //Description
            5, //Question Count
            this.subCategoryData.SALES_OPERATIONS,
            2, //Time taken (in minutes)
            '', //Data
            '{"theme": {"id": 5,"text": "Classic","color": ["#e715ff","#FEE715FF"],"shade": "#fad0ff","header": "Deep pink ","textColor": "#ffffff"},"background": {"id": 14,"name": "Dotted","value": "dot"}}' //Design
        ));
    }

    getTemplateToSave(
        name: string,
        category: string,
        desc: string,
        questionCount: number,
        subCategory: string,
        timeTaken: number,
        data: string,
        design: string
    ) {
        const template = new Templates();
        template.name = name;
        template.category = category;
        template.description = desc;
        template.questionCount = questionCount;
        template.subCategory = subCategory;
        template.timeTaken = timeTaken;
        template.data = data;
        template.design_json = design;
        if (this.templateKey.has(`${template.name}-${template.category}-${template.subCategory}`)) {
            template.name = this.DELETE_KEY
        }
        return template;
    }

}