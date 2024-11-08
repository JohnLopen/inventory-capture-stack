"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const Webhook_1 = require("./Webhook");
class WebhookService {
    /**
     *
     * @returns Webhook[]
     */
    static async getAll() {
        const allWebhooks = await new Webhook_1.Webhook().get();
        return allWebhooks;
    }
}
exports.WebhookService = WebhookService;
