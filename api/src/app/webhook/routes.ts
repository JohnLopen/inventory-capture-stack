import { Router } from 'express'
import { WebhookController } from './webhookController'

const webhookRoutes = Router()

// Get webhooks
webhookRoutes.get('/', WebhookController.get)

export default webhookRoutes