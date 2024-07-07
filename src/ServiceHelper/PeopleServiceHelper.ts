export class PeopleServiceHelper{

    validateCreatePersonPayload = (data : any) : boolean => {
        if(
            data.firstName == null || data.firstName.length < 1 ||
            data.lastName == null || data.lastName.length < 1 ||
            data.email == null || data.email.length < 1 ||
            data.company == null || data.company.length < 1
        ){
            return false;
        }
        return true;
    }

}