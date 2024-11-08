"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.hashPassword = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const { JWT_SECRET, JWT_EXPIRATION } = process.env;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}
const generateToken = (userId, email) => {
    const token = jsonwebtoken_1.default.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return token;
};
exports.generateToken = generateToken;
