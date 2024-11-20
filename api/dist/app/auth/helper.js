"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiKey = exports.generateToken = exports.checkPassword = exports.hashPassword = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const crypto = __importStar(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 *
 * @param password
 * @returns
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 *
 * @param password
 * @param hashedPassword
 * @returns
 */
const checkPassword = async (password, hashedPassword) => {
    return await bcrypt_1.default.compare(password, hashedPassword);
};
exports.checkPassword = checkPassword;
/**
 *
 * @param data
 * @returns
 */
const generateToken = (data) => {
    const { JWT_SECRET, JWT_EXPIRATION } = process.env;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables.');
    }
    const token = jsonwebtoken_1.default.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return token;
};
exports.generateToken = generateToken;
/**
 *
 * @returns
 */
const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 64 characters long
};
exports.generateApiKey = generateApiKey;
