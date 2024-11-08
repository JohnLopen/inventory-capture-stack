"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = exports.WebhookType = exports.WebhookProvider = void 0;
const base_model_1 = __importDefault(require("../../lib/db/base_model"));
const User_1 = require("../user/User");
var WebhookProvider;
(function (WebhookProvider) {
    WebhookProvider["Slack"] = "slack";
})(WebhookProvider || (exports.WebhookProvider = WebhookProvider = {}));
var WebhookType;
(function (WebhookType) {
    WebhookType["AutoEmail"] = "auto_email";
})(WebhookType || (exports.WebhookType = WebhookType = {}));
class Webhook extends base_model_1.default {
    constructor() {
        super('webhook');
        this.belongsTo(User_1.User, 'user_id', 'user');
    }
}
exports.Webhook = Webhook;
