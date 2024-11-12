import { Request, Response } from 'express'
import { User } from '../user/User'
import { UserService } from '../user/userService'
import { checkPassword, generateToken } from './helper'

export class AuthController {
    static async login(req: Request, resp: Response) {
        const { username, password } = req.body

        const user = await UserService.getByUsername(username)
        console.log('user', user)
        if (!user) {
            resp.sendStatus(403)
            return
        }

        const pass = await checkPassword(password, user.password)
        if (!pass) {
            resp.sendStatus(403)
            return
        }

        delete user.password
        const token = generateToken(user)

        resp.status(200).send({ user, token })
    }
}