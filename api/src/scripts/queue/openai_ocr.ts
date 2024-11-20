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
            const { imagePath, captureId } = queueData

            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64')

            let options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
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
                          serial: "Serial number (or Serial)/Lot code (or LC), must be combined value of serial and LC, or formatted as Serial/LC",
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
            }

            try {
                const response = await openai.chat.completions.create(options)
                    .catch(error => {
                        throw error
                    })

                // Remove base64 image url from inserting into the db
                let content: any = options!.messages[1].content
                content[0].image_url.url = ''

                if (response) {
                    const message: any = response.choices[0].message.content;
                    const captureData = {
                        ai_completion: JSON.stringify(options),
                        ai_response: JSON.stringify(response),
                        capture_id: captureId,
                    }
                    try {
                        const jsonData = JSON.parse(message.replace('```json', '').replace('```', ''))
                        console.log('json data', jsonData)

                        await new CaptureData().create({
                            ...captureData,
                            data: JSON.stringify(jsonData || {}),
                            status: 'success'
                        })
                    }
                    catch (error) {
                        await new CaptureData().create({
                            ...captureData,
                            data: JSON.stringify({ error, message }),
                            status: 'not_found'
                        })
                    }
                }
            }
            catch (error) {
                console.error('Error in openai ocr', error)
                await new CaptureData().create({
                    ai_completion: JSON.stringify(options),
                    capture_id: captureId,
                    data: JSON.stringify({ error }),
                    status: 'failed'
                })
            }

        } catch (error) {
            console.error('Failed to extract text:', error);
        }

        // if (process.env.NODE_ENV == 'development')
        //     break
    }
})();
