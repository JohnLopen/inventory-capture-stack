"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisQueue = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisQueue {
    constructor() {
        this.redis = new ioredis_1.default(); // Connect to Redis instance
    }
    // Push an item onto the queue (end of the list)
    async push(queue, item) {
        try {
            await this.redis.rpush(queue, JSON.stringify(item));
        }
        catch (error) {
            console.error('Error pushing item to queue:', error);
        }
    }
    // Pull an item from the queue (start of the list)
    async pull(queue) {
        try {
            const item = await this.redis.lpop(queue);
            return item ? JSON.parse(item) : null;
        }
        catch (error) {
            console.error('Error pulling item from queue:', error);
            return null;
        }
    }
    // Clear the queue
    async clear(queue) {
        try {
            await this.redis.del(queue);
        }
        catch (error) {
            console.error('Error clearing queue:', error);
        }
    }
    // Optional: Get queue length
    async length(queue) {
        try {
            return await this.redis.llen(queue);
        }
        catch (error) {
            console.error('Error getting queue length:', error);
            return 0;
        }
    }
}
exports.redisQueue = new RedisQueue();
