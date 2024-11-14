"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisCache {
    constructor(prefix = 'cache') {
        this.redis = new ioredis_1.default(); // Connect to Redis instance
        this.prefix = prefix;
    }
    // Set a value in the cache with an optional expiration time (in seconds)
    async set(key, value, expiration) {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const data = JSON.stringify(value);
            if (expiration) {
                await this.redis.setex(fullKey, expiration, data);
            }
            else {
                await this.redis.set(fullKey, data);
            }
        }
        catch (error) {
            console.error('Error setting cache:', error);
        }
    }
    // Get a value from the cache
    async get(key) {
        try {
            const fullKey = `${this.prefix}:${key}`;
            const data = await this.redis.get(fullKey);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }
    // Delete a specific cache entry
    async delete(key) {
        try {
            const fullKey = `${this.prefix}:${key}`;
            await this.redis.del(fullKey);
        }
        catch (error) {
            console.error('Error deleting cache:', error);
        }
    }
    // Clear all cache entries with the specified prefix
    async clear() {
        try {
            const keys = await this.redis.keys(`${this.prefix}:*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
}
exports.redisCache = new RedisCache();
