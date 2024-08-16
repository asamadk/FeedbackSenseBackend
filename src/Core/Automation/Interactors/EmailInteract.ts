import { emailNodePayload } from "../../../Types/FlowTypes";

export class EmailInteract {
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