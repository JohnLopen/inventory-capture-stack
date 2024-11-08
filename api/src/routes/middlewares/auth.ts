import { configDotenv } from 'dotenv';
configDotenv()

// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authenticateJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;  // Ensure we return here to prevent further execution
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded token payload to the request
        next(); // Call next() if successful
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
