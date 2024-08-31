import { google } from "googleapis";

export function getGoogleClient(){
    const oAuth2Client = new google.auth.OAuth2(
        process.env.G_SUIT_CLIENT_ID,
        process.env.G_SUIT_CLIENT_SECRET,
        process.env.G_SUIT_REDIRECT_URL
    );
    return oAuth2Client;
}