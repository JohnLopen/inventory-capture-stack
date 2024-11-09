import { Router } from 'express'
import captureRoutes from './capture/routes'

const inventoryRoutes = Router()

// Capture routes
inventoryRoutes.use('/capture', captureRoutes)

export default inventoryRoutes