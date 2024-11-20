import { configDotenv } from "dotenv";
import { sleep } from "../../helpers/string";
import { redisQueue } from "../../lib/redis/queue";
import { openaiLib } from "../../lib/openai/openai";
import { CaptureData } from "../../app/inventory/capture/CaptureData";
import { CaptureService } from "../../app/inventory/capture/captureService";

configDotenv();


// Usage example
(async () => {
    await sleep(5)

    // Check the queue for images indefinitely
    while (true) {
        await sleep(3)

        try {
            if (!process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: TEXT_ANALYSIS_QUEUE`)
            }

            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/uploads/signal-2024-11-08-15-27-04-867.jpg';
            const queueData = await redisQueue.pull(process.env.TEXT_ANALYSIS_QUEUE)
            if (!queueData) {
                console.log('Nothing on queue TEXT_ANALYSIS_QUEUE')
                continue
            }

            const { text, captureDataId } = queueData

            const { aiResponse, aiCompletion, parsedData }: any = await openaiLib.createCompletion({ role: 'user', content: text })
            console.log('Response from openai', { aiResponse, aiCompletion, parsedData })

            if (aiResponse) {
                await new CaptureData().update({
                    ai_completion: JSON.stringify(aiCompletion),
                    ai_response: JSON.stringify(aiResponse),
                    data: JSON.stringify(parsedData || {})
                }, captureDataId)
            }

        } catch (error) {
            console.error('Failed to extract text:', error);
        }
    }
})();
