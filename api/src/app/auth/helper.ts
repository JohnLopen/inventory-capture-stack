import { configDotenv } from 'dotenv';
configDotenv()

import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * 
 * @param password 
 * @returns 
 */
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * 
 * @param password 
 * @param hashedPassword 
 * @returns 
 */
export const checkPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * 
 * @param data 
 * @returns 
 */
export const generateToken = (data: Record<string, any>): string => {
    const { JWT_SECRET, JWT_EXPIRATION } = process.env;

    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    const token = jwt.sign(
        data,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );

    return token;
};

/**
 * 
 * @returns 
 */
export const generateApiKey = (): string => {
    return crypto.randomBytes(32).toString('hex'); // 64 characters long
}