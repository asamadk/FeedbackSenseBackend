export const getUserEmailFromRequest = (req : any) => {
    const userEmail = req.user.email;
    return userEmail;
}