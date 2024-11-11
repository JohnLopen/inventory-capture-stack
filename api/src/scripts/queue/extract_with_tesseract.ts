import { configDotenv } from "dotenv";
import { extractTextFromImage } from "../../lib/ocr/tesseract";
import { sleep } from "../../helpers/string";
import { redisQueue } from "../../lib/redis/queue";

configDotenv();


// Usage example
(async () => {
    await sleep(5)

    // Check the queue for images indefinitely
    while (true) {
        await sleep(3)

        try {
            if (!process.env.CAPTURE_IMAGES_QUEUE || !process.env.TEXT_ANALYSIS_QUEUE) {
                throw new Error(`Queue string not found: CAPTURE_IMAGES_QUEUE or TEXT_ANALYSIS_QUEUE`)
            }

            // const imagePath = '/home/john/projects/mike/ccrm/inventory-locator/api/uploads/signal-2024-11-08-15-27-04-867.jpg';
            const queueData = await redisQueue.pull(process.env.CAPTURE_IMAGES_QUEUE)
            if (!queueData) {
                console.log('Nothing on queue CAPTURE_IMAGES_QUEUE')
                continue
            }

            const { path, captureId } = queueData

            const text = await extractTextFromImage(path)
                .catch(error => {
                    throw error
                });

            if (text && text.length) {
                console.log('Extracted Text:', text);
                await redisQueue.push(process.env.TEXT_ANALYSIS_QUEUE, { captureId, text })
            }
            else {
                console.log('Text extraction returned no string for', { path, captureId })
            }

        } catch (error) {
            console.error('Failed to extract text:', error);
        }
    }
})();
