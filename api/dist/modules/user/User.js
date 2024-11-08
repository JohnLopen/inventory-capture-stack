"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.AccountType = void 0;
const base_model_1 = __importDefault(require("../../lib/db/base_model"));
var AccountType;
(function (AccountType) {
    AccountType["Customer"] = "customer";
    AccountType["Agent"] = "agent";
    AccountType["Administrator"] = "administrator";
})(AccountType || (exports.AccountType = AccountType = {}));
class User extends base_model_1.default {
    // table: string = 'user'
    constructor() {
        super('user');
    }
}
exports.User = User;
