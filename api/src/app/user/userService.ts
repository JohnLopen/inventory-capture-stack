import { User } from "./User";

export class UserService {

    /**
     * 
     * @param email 
     * @returns 
     */
    static getByUsername(username: string | undefined) {
        return new User().findWhere('username', username)
    }

    /**
     * 
     * @param apiKey 
     * @returns 
     */
    static findByApiKey(apiKey: string) {
        return new User().findWhere('api_key', apiKey)
    }

}