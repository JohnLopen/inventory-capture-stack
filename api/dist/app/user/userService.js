"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("./User");
class UserService {
    /**
     *
     * @param email
     * @returns
     */
    static getByUsername(email) {
        return new User_1.User().findWhere('username', email);
    }
    /**
     *
     * @param apiKey
     * @returns
     */
    static findByApiKey(apiKey) {
        return new User_1.User().findWhere('api_key', apiKey);
    }
}
exports.UserService = UserService;
