"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const Webhook_1 = require("./Webhook");
class WebhookController {
    static async get(req, resp) {
        const allWebhooks = await new Webhook_1.Webhook().get();
        resp.status(200).send({ status: 'OK', allWebhooks });
    }
}
exports.WebhookController = WebhookController;
