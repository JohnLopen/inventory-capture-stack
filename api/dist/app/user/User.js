"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.AccountType = void 0;
const BaseModel_1 = __importDefault(require("../../lib/db/BaseModel"));
var AccountType;
(function (AccountType) {
    AccountType["Customer"] = "customer";
    AccountType["Agent"] = "agent";
    AccountType["Administrator"] = "administrator";
})(AccountType || (exports.AccountType = AccountType = {}));
class User extends BaseModel_1.default {
    // table: string = 'user'
    constructor() {
        super('user');
        // this.guarded = ['password']
    }
}
exports.User = User;
