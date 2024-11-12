import { configDotenv } from 'dotenv';
configDotenv()

// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../app/user/User';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export interface AuthenticatedRequest extends Request {
    user: User;
}

declare global {
    namespace Express {
      interface Request {
        user: User; // Adjust the type to whatever your decoded JWT contains
      }
    }
  }

export const authenticateJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.header('Authorization');

    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;  // Ensure we return here to prevent further execution
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded as User; // Attach decoded token payload to the request
        next(); // Call next() if successful
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
