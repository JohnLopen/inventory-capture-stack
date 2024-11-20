"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const string_1 = require("../../helpers/string");
const queue_1 = require("../../lib/redis/queue");
const openai_1 = require("../../lib/openai/openai");
const CaptureData_1 = require("../../app/inventory/capture/CaptureData");
(0, dotenv_1.configDotenv)();
// Usage example
(async () => {
    await (0, string_1.sleep)(5);
    // Check the queue for images indefinitely
    while (true) {
        await (0, string_1.sleep)(3);
        try {
            if (!process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: TEXT_ANALYSIS_QUEUE`);
            }
            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/uploads/signal-2024-11-08-15-27-04-867.jpg';
            const queueData = await queue_1.redisQueue.pull(process.env.TEXT_ANALYSIS_QUEUE);
            if (!queueData) {
                console.log('Nothing on queue TEXT_ANALYSIS_QUEUE');
                continue;
            }
            const { text, captureDataId } = queueData;
            const { aiResponse, aiCompletion, parsedData } = await openai_1.openaiLib.createCompletion({ role: 'user', content: text });
            console.log('Response from openai', { aiResponse, aiCompletion, parsedData });
            if (aiResponse) {
                await new CaptureData_1.CaptureData().update({
                    ai_completion: JSON.stringify(aiCompletion),
                    ai_response: JSON.stringify(aiResponse),
                    data: JSON.stringify(parsedData || {})
                }, captureDataId);
            }
        }
        catch (error) {
            console.error('Failed to extract text:', error);
        }
    }
})();
