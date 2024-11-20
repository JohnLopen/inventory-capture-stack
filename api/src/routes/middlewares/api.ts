import { NextFunction } from "express";
import { UserService } from "../../app/user/userService";
import { User } from "../../app/user/User";

// Middleware to verify the API key
export async function apiKeyMiddleware(req: any, res: any, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }

    try {
        // Query to find a user with the provided API key
        const user: User = await UserService.findByApiKey(apiKey)

        // Check if a user with the provided API key exists
        if (!user?.id) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        console.log('Api middleware finish')
    }
}