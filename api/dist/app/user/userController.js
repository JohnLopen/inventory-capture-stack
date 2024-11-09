"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_1 = require("./User");
class UserController {
    static async get(req, resp) {
        const allUsers = await new User_1.User().get();
        resp.status(200).send({ status: 'OK', allUsers });
    }
}
exports.UserController = UserController;
