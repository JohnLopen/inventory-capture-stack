import { User } from "./User";

export class UserService {

    static getByUsername(email: string | undefined) {
        return new User().findWhere('username', email)
    }

    generatePassword(password: string) {
        
    }
}