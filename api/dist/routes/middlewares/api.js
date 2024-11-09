"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = apiKeyMiddleware;
const userService_1 = require("../../app/user/userService");
// Middleware to verify the API key
async function apiKeyMiddleware(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }
    try {
        // Query to find a user with the provided API key
        const user = await userService_1.UserService.findByApiKey(apiKey);
        // Check if a user with the provided API key exists
        if (!user?.id) {
            return res.status(401).json({ message: 'Invalid API key' });
        }
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
    finally {
        console.log('Api middleware finish');
    }
}
