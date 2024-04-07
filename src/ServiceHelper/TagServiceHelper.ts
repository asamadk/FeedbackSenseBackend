export class TagServiceHelper{

    validateCreateTagPayload = (data : any) : boolean => {
        if(!data.name || !data.companyId || !data.status){return false;}
        return true;
    }

}