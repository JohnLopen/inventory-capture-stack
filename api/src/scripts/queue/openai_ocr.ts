import { configDotenv } from "dotenv";
configDotenv();

import fs from 'fs'
import { sleep } from "../../helpers/string";
import { redisQueue } from "../../lib/redis/queue";
import { CaptureData } from "../../app/inventory/capture/CaptureData";
import OpenAI from "openai";



// Usage example
(async () => {
    await sleep(5)

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_PROJECT_KEY,
    })

    // Check the queue for images indefinitely
    while (true) {
        await sleep(3)

        try {
            if (!process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: TEXT_ANALYSIS_QUEUE`)
            }

            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/src/uploads/17314962078774166951718010119384.jpg';
            const queueData = await redisQueue.pull(process.env.TEXT_ANALYSIS_QUEUE)
            if (!queueData) {
                console.log('Nothing on queue TEXT_ANALYSIS_QUEUE')
                continue
            }
            const { imagePath, captureDataId } = queueData

            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64')

            const options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: `
                        You extract data from the image of a product label. The data will be returned in JSON format.
                        Please read the label and discern the details (some fields may remain blank) in the following format. 
                        I expect a JSON response. The response should use this format, and ONLY these keys:
                        {
                          MPN: "Part number (or MPN or manufacturer part number)",
                          IPN: "Secondary part number",
                          Mfr: "Manufacturer (or MFR or MFG)",
                          Qty: "Quantity (or QTY)",
                          DC: "Date code (or DC)",
                          RoHS: "RoHS Status",
                          LC: "Lot code (or LC)",
                          Serial: "Serial number",
                          MSL: "MSL Level (or moisture sensitivity level)"
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
            }


            try {
                const response = await openai.chat.completions.create(options)

                if (response) {
                    const message: any = response.choices[0].message.content;
                    const jsonData = JSON.parse(message.replace('```json', '').replace('```', ''))
                    console.log('json data', jsonData)

                    await new CaptureData().update({
                        ai_completion: JSON.stringify(options),
                        ai_response: JSON.stringify(response),
                        data: JSON.stringify(jsonData || {})
                    }, captureDataId)
                }
            }
            catch (error) {
                console.error('Error in openai ocr', error)
            }

        } catch (error) {
            console.error('Failed to extract text:', error);
        }

        if (process.env.NODE_ENV == 'development')
            break
    }
})();
