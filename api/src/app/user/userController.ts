import { Request, Response } from 'express'
import { User } from './User'

export class UserController {
    static async get(req: Request, resp: Response) {
        const allUsers = await new User().get()
        resp.status(200).send({ status: 'OK', allUsers })
    }
}