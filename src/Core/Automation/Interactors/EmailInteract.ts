import { emailNodePayload } from "../../../Types/FlowTypes";

export class EmailInteract {
    static instance: EmailInteract;

    static getInstance() {
        if (this.instance == null) {
            this.instance = new EmailInteract();
        }
        return this.instance;
    }

    private emailList: emailNodePayload[] = [];

    addEmail(payload: emailNodePayload) {
        if (this.emailList == null) {
            this.emailList = [];
        }
        this.emailList.push(payload);
    }
    
    async sendEmails(){
        //TODO write body
        this.clearData();
    }

    clearData(){
        this.emailList = [];
    }
}