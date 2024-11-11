import Redis from 'ioredis';

class RedisCache<T> {
    private redis: Redis;
    private prefix: string;

    constructor(prefix: string = 'cache') {
        this.redis = new Redis(); // Connect to Redis instance
        this.prefix = prefix;
    }

    // Set a value in the cache with an optional expiration time (in seconds)
    async set(key: string, value: T, expiration?: number): Promise<void> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const data = JSON.stringify(value);

            if (expiration) {
                await this.redis.setex(fullKey, expiration, data);
            } else {
                await this.redis.set(fullKey, data);
            }
        } catch (error) {
            console.error('Error setting cache:', error);
        }
    }

    // Get a value from the cache
    async get(key: string): Promise<T | null> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const data = await this.redis.get(fullKey);
            return data ? JSON.parse(data) as T : null;
        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }

    // Delete a specific cache entry
    async delete(key: string): Promise<void> {
        try {
            const fullKey = `${this.prefix}:${key}`;
            await this.redis.del(fullKey);
        } catch (error) {
            console.error('Error deleting cache:', error);
        }
    }

    // Clear all cache entries with the specified prefix
    async clear(): Promise<void> {
        try {
            const keys = await this.redis.keys(`${this.prefix}:*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
}

export const redisCache = new RedisCache<any>()