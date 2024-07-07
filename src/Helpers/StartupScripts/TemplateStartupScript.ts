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
        CUSTOMER : 'CUSTOMER'
    }

    subCategoryData = {
        CUSTOMER_SATISFACTION_SURVEY : 'Satisfaction Surveys',
        CSAT : 'CSAT',
    }

    async initialize() {
        logger.info('Template startup initialized.');
        await this.getAllExistingTemplates();
        this.addTemplatesToList();
        await this.saveTemplates();
    }

    async saveTemplates() {
        let finalSaveList: Templates[] = [];
        this.toInsertTemplateList.forEach(template => {
            if (template.name !== this.DELETE_KEY) {
                finalSaveList.push(template);
            }
        });
        
        finalSaveList =  this.updateTemplatesStyle(finalSaveList);
        await this.templateRepo.save(finalSaveList);
    }

    updateTemplatesStyle(temps : Templates[]):Templates[]{
        const tmpList :Templates[]= [];
        temps.forEach(tmp => {
            const data = tmp.data;
            const obj = JSON.parse(data);
            obj.nodes.forEach((o:any) => {
                const id :number = o.data.compId;
                o.style = {
                    "color": this.getColor(id),
                    "width": "300px",
                    "height": "120px",
                    "borderRadius": "3px",
                    "padding": "10px",
                    "boxShadow": "0px 0px 20px 3px rgba(0,0,0,0.20)",
                    "background": "#ffffff"
                }
            });

            obj.edges.forEach((e : any) => {
                if(e.labelStyle == null){return;}
                e.labelStyle.color = '#ffffff';
                e.labelStyle.fill = '#ffffff';
                e.labelBgStyle.fill = '#8039DF';
                e.labelBgStyle.background = '#8039DF';
                e.style.stroke = '#3D0A74';
                e.markerEnd.color = '#3D0A74';
            });
            tmp.data = JSON.stringify(obj);
            tmpList.push(tmp);
        });
        return tmpList;
    }

    getColor(id : number):string{
        if(id === 1){
            return '#527853';
        }else if(id === 3){
            return '#0802A3';
        }else if(id === 4){
            return '#7B2869';
        }else if(id === 5){
            return '#0A81AB';
        }else if(id === 6){
            return '#FFB84C';
        }else if(id === 7){
            return '#FAD800';
        }else if(id === 8){
            return '#43658B';
        }else if(id === 11){
            return '#6E2142';
        }else if(id === 13){
            return '#5F4444';
        }else if(id === 14){
            return '#808080';
        }
    }

    async getAllExistingTemplates() {
        const templates = await this.templateRepo.find();
        templates.forEach(template => {
            const key = `${template.name}-${template.category}-${template.subCategory}`;
            this.templateKey.add(key);
        });
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

    addTemplatesToList() {
        this.toInsertTemplateList.push(this.getTemplateToSave(
            'Product Satisfaction Survey Template', //Name
            this.categoriesData.CUSTOMER, //Category
            'Use this simple rating question to discover how loyal customers are to your brand.', //Description
            9, //Question Count
            this.subCategoryData.CUSTOMER_SATISFACTION_SURVEY, //Sub category
            1, //Time taken (in minutes)
            '{"nodes":[{"width":300,"height":120,"id":"p-59ba52bd-a0fd-4b72-8555-e17a70fe75a0","type":"selectorNode","data":{"uId":"p-59ba52bd-a0fd-4b72-8555-e17a70fe75a0","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"While thinking about your most recent experience with [COMPANY], how was the quality of customer service you received?\\",\\"answerList\\":[\\"Superior\\",\\"Very Satisfactory\\",\\"About Average\\",\\"Somewhat Unsatisfactory\\",\\"Very Poor\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#0802A3","width":"300px","height":"120px","borderRadius":"3px","padding":"10px","boxShadow":"0px 0px 20px 3px rgba(0,0,0,0.20)","background":"#ffffff"},"position":{"x":457,"y":56},"selected":false,"positionAbsolute":{"x":457,"y":56},"dragging":false},{"width":300,"height":120,"id":"p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44","type":"selectorNode","data":{"uId":"p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Now please think about the features and benefits of the [PRODUCT] itself. How satisfied are you with the [PRODUCT]:\\",\\"answerList\\":[\\"Superior\\",\\"Very Satisfactory\\",\\"About Average\\",\\"Somewhat Unsatisfactory\\",\\"Very Poor\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#0802A3","width":"300px","height":"120px","borderRadius":"3px","padding":"10px","boxShadow":"0px 0px 20px 3px rgba(0,0,0,0.20)","background":"#ffffff"},"position":{"x":460,"y":234},"selected":false,"positionAbsolute":{"x":460,"y":234},"dragging":false},{"width":300,"height":120,"id":"p-4511d9a1-6cfb-481b-9444-262ec17aa7b3","type":"selectorNode","data":{"uId":"p-4511d9a1-6cfb-481b-9444-262ec17aa7b3","compId":5,"label":"Text answer","description":"Provide a text box so people can share written, open-ended feedback.","compConfig":"{\\"question\\":\\"If you are not satisfied with the product, will you please describe why.\\",\\"logic\\":[],\\"required\\":false,\\"existing\\":false}"},"style":{"color":"#0A81AB","width":"300px","height":"120px","borderRadius":"3px","padding":"10px","boxShadow":"0px 0px 20px 3px rgba(0,0,0,0.20)","background":"#ffffff"},"position":{"x":459.5,"y":414},"selected":true,"positionAbsolute":{"x":459.5,"y":414},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#ffffff","fill":"#ffffff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#8039DF","background":"#8039DF"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#3D0A74"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#3D0A74"},"source":"p-59ba52bd-a0fd-4b72-8555-e17a70fe75a0","sourceHandle":"bottom-handle","target":"p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44","targetHandle":"top-handle","id":"reactflow__edge-p-59ba52bd-a0fd-4b72-8555-e17a70fe75a0bottom-handle-p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44top-handle"},{"type":"straight","labelStyle":{"color":"#ffffff","fill":"#ffffff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#8039DF","background":"#8039DF"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#3D0A74"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#3D0A74"},"source":"p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44","sourceHandle":"bottom-handle","target":"p-4511d9a1-6cfb-481b-9444-262ec17aa7b3","targetHandle":"top-handle","id":"reactflow__edge-p-80148090-7bf1-4d6d-a9ac-c2b2efb14c44bottom-handle-p-4511d9a1-6cfb-481b-9444-262ec17aa7b3top-handle"}],"viewport":{"x":-0.5,"y":-52,"zoom":1}}', //Data
            '{"theme":{"id":2,"header":"Black","text":"Trending","color":["#454545","#C9EEFF"],"textColor":"#ffffff","shade":"#b3b3b3"},"background":{"id":1,"name":"Clouds","value":"cloud-waves"}}' //Design
        ));

        this.toInsertTemplateList.push(this.getTemplateToSave(
            'Customer Satisfaction Survey', //Name
            this.categoriesData.CUSTOMER, //Category
            'Use this simple rating question to discover how loyal customers are to your brand.', //Description
            9, //Question Count
            this.subCategoryData.CSAT, //Sub category
            1, //Time taken (in minutes)
            '{"nodes":[{"width":300,"height":120,"id":"p-5bc77e2f-53d4-488c-b9e0-07d165d9a63d","type":"selectorNode","data":{"uId":"p-5bc77e2f-53d4-488c-b9e0-07d165d9a63d","compId":3,"label":"Single answer selection","description":"Get people to select only one option. Good for getting definite answers.","compConfig":"{\\"question\\":\\"Based on your most recent interaction with our company, how likely are you to purchase our products or services again?\\",\\"answerList\\":[\\"Extremely Likely\\",\\"Very Likely\\",\\"Moderately Likely\\",\\"Slightly Likely\\",\\"Not at all likely\\"],\\"type\\":\\"single\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#0802A3","width":"300px","height":"120px","borderRadius":"3px","padding":"10px","boxShadow":"0px 0px 20px 3px rgba(0,0,0,0.20)","background":"#ffffff"},"position":{"x":512,"y":272},"selected":true,"positionAbsolute":{"x":512,"y":272},"dragging":false},{"width":300,"height":120,"id":"p-152aec79-cf67-4427-97a0-684cb1e9fe0a","type":"selectorNode","data":{"uId":"p-152aec79-cf67-4427-97a0-684cb1e9fe0a","compId":9,"label":"CSAT","description":"Measure customer satisfaction, increase client retention and augment customer experience.","compConfig":"{\\"question\\":\\"Overall, how satisfied are you with your most recent interaction with our company?\\",\\"leftText\\":\\"\\",\\"rightText\\":\\"\\",\\"logic\\":[],\\"existing\\":false}"},"style":{"color":"#592de0","width":"300px","height":"120px","borderRadius":"3px","padding":"10px","boxShadow":"0px 0px 20px 3px rgba(0,0,0,0.20)","background":"#ffffff"},"position":{"x":506,"y":88},"selected":false,"positionAbsolute":{"x":506,"y":88},"dragging":false}],"edges":[{"type":"straight","labelStyle":{"color":"#ffffff","fill":"#ffffff","fontWeight":800,"fontSize":12},"labelShowBg":true,"labelBgStyle":{"fill":"#8039DF","background":"#8039DF"},"labelBgPadding":[10,10],"labelBgBorderRadius":15,"style":{"strokeWidth":1,"stroke":"#3D0A74"},"animated":false,"markerEnd":{"type":"arrowclosed","width":25,"height":25,"color":"#3D0A74"},"source":"p-152aec79-cf67-4427-97a0-684cb1e9fe0a","sourceHandle":"b","target":"p-5bc77e2f-53d4-488c-b9e0-07d165d9a63d","targetHandle":null,"id":"reactflow__edge-p-152aec79-cf67-4427-97a0-684cb1e9fe0ab-p-5bc77e2f-53d4-488c-b9e0-07d165d9a63d"}],"viewport":{"x":0,"y":0,"zoom":1}}', //Data
            '{"theme":{"id":2,"header":"Black","text":"Trending","color":["#454545","#C9EEFF"],"textColor":"#ffffff","shade":"#b3b3b3"},"background":{"id":1,"name":"Clouds","value":"cloud-waves"}}' //Design
        ));

    }

}