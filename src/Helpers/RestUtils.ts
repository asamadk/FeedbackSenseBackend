export const getUserEmailFromRequest = (req : any) => {
    const userEmail = req.user._json.email;
    return userEmail;
}