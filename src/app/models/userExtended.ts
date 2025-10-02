import { User, UserPermission } from "../backend";

export class UserExtended implements User
{
    public userName?: string | null;
    public email?: string | null;

    public constructor(usr: User){
        this.userName = usr.userName;
        this.email = usr.email;
    }
};
