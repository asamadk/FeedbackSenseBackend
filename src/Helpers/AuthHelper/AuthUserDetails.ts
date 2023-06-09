import { UserProfile } from "../../Types/AuthTypes";

export class AuthUserDetails {

    static instance: AuthUserDetails;

    static getInstance(): AuthUserDetails {
        if (this.instance == null) {
            this.instance = new AuthUserDetails();
        }
        return this.instance;
    }

    private authUserProfile : UserProfile

    setUserDetails(authUserProfile : UserProfile) : void{
        this.authUserProfile = authUserProfile
    }

    getUserDetails() : UserProfile{
        return this.authUserProfile;
    }

}