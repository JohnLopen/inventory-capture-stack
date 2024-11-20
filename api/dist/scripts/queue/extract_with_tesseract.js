"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const tesseract_1 = require("../../lib/ocr/tesseract");
const string_1 = require("../../helpers/string");
const queue_1 = require("../../lib/redis/queue");
const CaptureData_1 = require("../../app/inventory/capture/CaptureData");
(0, dotenv_1.configDotenv)();
// Usage example
(async () => {
    await (0, string_1.sleep)(5);
    // Check the queue for images indefinitely
    while (true) {
        await (0, string_1.sleep)(3);
        try {
            if (!process.env.CAPTURE_IMAGES_QUEUE || !process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: CAPTURE_IMAGES_QUEUE or TEXT_ANALYSIS_QUEUE`);
            }
            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/uploads/signal-2024-11-08-15-27-04-867.jpg';
            const queueData = await queue_1.redisQueue.pull(process.env.CAPTURE_IMAGES_QUEUE);
            if (!queueData) {
                console.log('Nothing on queue CAPTURE_IMAGES_QUEUE');
                continue;
            }
            let { path, captureId } = queueData;
            if (process.env.SAMPLE_CAPTURE)
                path = process.env.SAMPLE_CAPTURE;
            const text = await (0, tesseract_1.extractTextFromImage)(path)
                .catch(error => {
                throw error;
            });
            if (text && text.length) {
                console.log('Extracted Text:', text);
                const captureDataModel = new CaptureData_1.CaptureData();
                let captureData = await captureDataModel.getWhere(`capture_id=${captureId}`);
                let captureDataId = captureData?.id;
                // Record OCR text results
                if (!captureDataId) {
                    const newCaptureData = await captureDataModel.create({ capture_id: captureId, ocr_data: text });
                    captureDataId = newCaptureData?.insertId;
                }
                await queue_1.redisQueue.push(process.env.TEXT_ANALYSIS_QUEUE, { captureDataId, text });
                console.log('Text extraction finished, openai queue updated', { path, captureId });
            }
            else {
                console.log('Text extraction returned no string for', { path, captureId });
            }
        }
        catch (error) {
            console.error('Failed to extract text:', error);
        }
    }
})();
