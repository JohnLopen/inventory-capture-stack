"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const helper_1 = require("../app/auth/helper");
(0, dotenv_1.configDotenv)();
(async () => {
    // const userId = 1
    const api_key = (0, helper_1.generateApiKey)();
    console.log({ api_key });
    // await new User().update({ api_key }, userId)
    // console.log('New api key issued for user with id ', userId)
})();
