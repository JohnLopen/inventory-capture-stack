"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const queue_1 = require("../../lib/redis/queue");
(0, dotenv_1.configDotenv)();
(async () => {
    const path = '/home/john/projects/mike/ccrm/inventory-locator/api/uploads/signal-2024-11-08-15-27-04-867.jpg';
    if (!process.env.CAPTURE_IMAGES_QUEUE) {
        throw new Error(`Queue string not found: CAPTURE_IMAGES_QUEUE`);
    }
    await queue_1.redisQueue.push(process.env.CAPTURE_IMAGES_QUEUE, { path, captureId: 123 });
    console.log('Test image sent to queue', process.env.CAPTURE_IMAGES_QUEUE);
    process.exit(0);
})();
