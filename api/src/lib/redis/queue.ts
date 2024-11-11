import Redis from 'ioredis';

class RedisQueue<T> {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(); // Connect to Redis instance
    }

    // Push an item onto the queue (end of the list)
    async push(queue: string, item: T): Promise<void> {
        try {
            await this.redis.rpush(queue, JSON.stringify(item));
        } catch (error) {
            console.error('Error pushing item to queue:', error);
        }
    }

    // Pull an item from the queue (start of the list)
    async pull(queue: string): Promise<T | null> {
        try {
            const item = await this.redis.lpop(queue);
            return item ? JSON.parse(item) as T : null;
        } catch (error) {
            console.error('Error pulling item from queue:', error);
            return null;
        }
    }

    // Clear the queue
    async clear(queue: string): Promise<void> {
        try {
            await this.redis.del(queue);
        } catch (error) {
            console.error('Error clearing queue:', error);
        }
    }

    // Optional: Get queue length
    async length(queue: string): Promise<number> {
        try {
            return await this.redis.llen(queue);
        } catch (error) {
            console.error('Error getting queue length:', error);
            return 0;
        }
    }
}

export const redisQueue = new RedisQueue<any>()
