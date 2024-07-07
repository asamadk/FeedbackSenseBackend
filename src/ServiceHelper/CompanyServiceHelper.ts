export class CompanyServiceHelper{

    validateCreateCompanyPayload = (data : any) : boolean => {
        if(!data.name || !data.website){return false;}
        return true;
    }

}