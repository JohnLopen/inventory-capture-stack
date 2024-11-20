"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});
