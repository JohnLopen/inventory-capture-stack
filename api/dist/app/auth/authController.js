"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userService_1 = require("../user/userService");
const helper_1 = require("./helper");
class AuthController {
    static async login(req, resp) {
        const { username, password } = req.body;
        const user = await userService_1.UserService.getByUsername(username);
        console.log('user', user);
        if (!user) {
            resp.sendStatus(403);
            return;
        }
        const pass = await (0, helper_1.checkPassword)(password, user.password);
        if (!pass) {
            resp.sendStatus(403);
            return;
        }
        delete user.password;
        const token = (0, helper_1.generateToken)(user);
        resp.status(200).send({ user, token });
    }
}
exports.AuthController = AuthController;
