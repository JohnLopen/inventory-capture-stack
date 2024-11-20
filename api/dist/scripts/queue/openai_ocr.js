"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const fs_1 = __importDefault(require("fs"));
const string_1 = require("../../helpers/string");
const queue_1 = require("../../lib/redis/queue");
const CaptureData_1 = require("../../app/inventory/capture/CaptureData");
const openai_1 = __importDefault(require("openai"));
// Usage example
(async () => {
    await (0, string_1.sleep)(5);
    const openai = new openai_1.default({
        apiKey: process.env.OPENAI_PROJECT_KEY,
    });
    // Check the queue for images indefinitely
    while (true) {
        await (0, string_1.sleep)(3);
        try {
            if (!process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: TEXT_ANALYSIS_QUEUE`);
            }
            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/src/uploads/17314962078774166951718010119384.jpg';
            const queueData = await queue_1.redisQueue.pull(process.env.TEXT_ANALYSIS_QUEUE);
            if (!queueData) {
                console.log('Nothing on queue TEXT_ANALYSIS_QUEUE');
                continue;
            }
            const { imagePath, captureId } = queueData;
            const imageBuffer = fs_1.default.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const options = {
                model: "gpt-4o",
                messages: [{
                        role: "system",
                        content: `
                        You extract data from the image of a product label. The data will be returned in JSON format. 
                        I expect a JSON response. Please read the label and discern the details (some fields may remain blank) in the following format. I expect a JSON response. The response should use this format, and ONLY these keys:
                        {
                          mpn: "Part number (or MPN or manufacturer part number)",
                          ipn: "Secondary part number",
                          mfr: "Manufacturer (or MFR or MFG)",
                          qty: "Quantity (or QTY)",
                          dc: "Date code (or DC) which should be written in one of two ways: 1) YYWW format where YY equals a 2 digit year code and WW equals a 2 digit week code, 2) Traditional date format",
                          rohs: "RoHS Status",
                          lc: "Lot code (or LC)",
                          serial: "Serial number",
                          msl: "MSL Level (or moisture sensitivity level)",
                          coo: "Country of Origin"
                        }
                      `,
                    }, {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`,
                                },
                            },
                        ],
                    }],
            };
            try {
                const response = await openai.chat.completions.create(options)
                    .catch(error => {
                    throw error;
                });
                if (response) {
                    const message = response.choices[0].message.content;
                    const captureData = {
                        ai_completion: JSON.stringify(options),
                        ai_response: JSON.stringify(response),
                        capture_id: captureId,
                    };
                    try {
                        const jsonData = JSON.parse(message.replace('```json', '').replace('```', ''));
                        console.log('json data', jsonData);
                        await new CaptureData_1.CaptureData().create({
                            ...captureData,
                            data: JSON.stringify(jsonData || {}),
                            status: 'success'
                        });
                    }
                    catch (error) {
                        await new CaptureData_1.CaptureData().create({
                            ...captureData,
                            data: JSON.stringify({ error, message }),
                            status: 'not_found'
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error in openai ocr', error);
                await new CaptureData_1.CaptureData().create({
                    ai_completion: JSON.stringify(options),
                    capture_id: captureId,
                    data: JSON.stringify({ error }),
                    status: 'failed'
                });
            }
        }
        catch (error) {
            console.error('Failed to extract text:', error);
        }
        if (process.env.NODE_ENV == 'development')
            break;
    }
})();
