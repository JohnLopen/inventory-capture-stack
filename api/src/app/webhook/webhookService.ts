import { Webhook } from './Webhook'

export class WebhookService {

    /**
     * 
     * @returns Webhook[]
     */
    static async getAll() {
        const allWebhooks = await new Webhook().get()
        return allWebhooks
    }

}