"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const helper_1 = require("../app/auth/helper");
(0, dotenv_1.configDotenv)();
(async () => {
    const passwordPlain = '12345678';
    const password = await (0, helper_1.hashPassword)(passwordPlain);
    console.log('New user password', password);
    // Compare
    const passed = await (0, helper_1.checkPassword)(passwordPlain, password);
    console.log('passed', passed);
})();
