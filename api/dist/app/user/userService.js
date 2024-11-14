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
    static getByUsername(username) {
        return new User_1.User().findWhere('username', username);
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
