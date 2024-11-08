import { Request, Response } from 'express'
import { Webhook } from './Webhook'

export class WebhookController {
    static async get(req: Request, resp: Response) {
        const allWebhooks = await new Webhook().get()
        resp.status(200).send({ status: 'OK', allWebhooks })
    }
}