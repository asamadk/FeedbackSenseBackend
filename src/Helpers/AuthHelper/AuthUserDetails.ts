import { User } from "../../Entity/UserEntity";

export class AuthUserDetails {

    static instance: AuthUserDetails;

    static getInstance(): AuthUserDetails {
        if (this.instance == null) {
            this.instance = new AuthUserDetails();
        }
        return this.instance;
    }

    private authUserProfile : User

    setUserDetails(authUserProfile : User) : void{
        this.authUserProfile = authUserProfile
    }

    getUserDetails() : User{
        return this.authUserProfile;
    }

}