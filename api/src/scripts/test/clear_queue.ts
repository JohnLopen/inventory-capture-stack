import { configDotenv } from "dotenv";
import { redisQueue } from "../../lib/redis/queue";

configDotenv();

(async () => {
    if (!process.env.CAPTURE_IMAGES_QUEUE || !process.env.TEXT_ANALYSIS_QUEUE) {
        throw new Error(`Queue string not found: CAPTURE_IMAGES_QUEUE`)
    }

    await redisQueue.clear(process.env.CAPTURE_IMAGES_QUEUE)
    await redisQueue.clear(process.env.TEXT_ANALYSIS_QUEUE)

    process.exit(0)
})()