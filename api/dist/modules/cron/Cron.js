"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cron = exports.CronType = void 0;
const base_model_1 = __importDefault(require("../../lib/db/base_model"));
const Webhook_1 = require("../webhook/Webhook");
var CronType;
(function (CronType) {
    CronType["AutoEmail"] = "auto_email";
})(CronType || (exports.CronType = CronType = {}));
class Cron extends base_model_1.default {
    constructor() {
        super('cron');
        this.belongsTo(Webhook_1.Webhook, 'webhook_id', 'webhook');
    }
}
exports.Cron = Cron;
