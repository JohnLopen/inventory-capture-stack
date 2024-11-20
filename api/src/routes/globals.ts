import { Request } from 'express'
import { User } from "../app/user/User";

export interface AuthenticatedRequest extends Request {
    user: User;
}

declare global {
    namespace Express {
        interface Request {
            user: User;
        }
    }
}
