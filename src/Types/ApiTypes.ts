export type responseRest = {
    success : boolean,
    message : string,
    data : any,
    statusCode : number
}

export type InviteData = {
    role: 'OWNER' | 'ADMIN' | 'USER' | 'GUEST';
    email: string;
    invitedBy: string;
    date: Date;
};