"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const User_1 = require("../app/user/User");
const helper_1 = require("../app/auth/helper");
(0, dotenv_1.configDotenv)();
(async () => {
    const user = await new User_1.User().guard(['password']).find(1);
    const token = (0, helper_1.generateToken)(user);
    console.log('New user token', token);
})();
