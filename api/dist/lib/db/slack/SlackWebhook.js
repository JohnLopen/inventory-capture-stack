"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackWebhook = void 0;
class SlackWebhook {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }
    async postMessage(message, blocks = null) {
        const payload = {
            text: message,
            ...(blocks && { blocks }) // Only include blocks if provided
        };
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                console.log('Message posted successfully.');
            }
            else {
                console.error(`Failed to post message: ${response.status} ${response.statusText}`);
            }
        }
        catch (error) {
            console.error('Error posting message:', error);
        }
    }
}
exports.SlackWebhook = SlackWebhook;
