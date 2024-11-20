"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const queue_1 = require("../../lib/redis/queue");
(0, dotenv_1.configDotenv)();
(async () => {
    if (!process.env.CAPTURE_IMAGES_QUEUE || !process.env.TEXT_ANALYSIS_QUEUE) {
        throw new Error(`Queue string not found: CAPTURE_IMAGES_QUEUE`);
    }
    await queue_1.redisQueue.clear(process.env.CAPTURE_IMAGES_QUEUE);
    await queue_1.redisQueue.clear(process.env.TEXT_ANALYSIS_QUEUE);
    process.exit(0);
})();
