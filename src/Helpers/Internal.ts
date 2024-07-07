import { createCompany } from "../Service/CompanyService";
import { Repository } from "./Repository";

export class Internal{

    //used for internal purposed like running a start script, creating companies etc
    async init(){
        await Promise.all([
            this.createComp('Alpha','www.alpha.io'),
            this.createComp('Beta','www.beta.io'),
            this.createComp('Gamma','www.gamma.io'),
            this.createComp('Theta','www.theta.io'),
            this.createComp('Delta','www.delta.io'),
            this.createComp('Sigma','www.sigma.io'),
            this.createComp('Chi','www.chi.io'),
            this.createComp('Pi','www.pi.io'),
            this.createComp('Fi','www.fi.io'),
        ]);

        Repository.getCompany()
    }

    async createComp(name :string,website :string){
        const payload = {
            name : name,
            website : website
        }
        return createCompany(payload);
    }
}