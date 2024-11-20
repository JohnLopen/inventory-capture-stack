import { Router, Request, Response } from 'express'
import userRoutes from '../app/user/routes'
import { authMiddleware } from './middlewares/auth'
import authRoutes from '../app/auth/routes'
import inventoryRoutes from '../app/inventory/routes'

const mainRouter = Router()

// External checking endpoint
mainRouter.get(
    "/health",
    async (req: Request, res: Response) => {
        res.status(200).send({ status: 'OK' })
    }
)

// App routes

// User
mainRouter.use('/auth', authRoutes)
mainRouter.use('/users', authMiddleware, userRoutes)

// Inventory routes
mainRouter.use('/inventory', inventoryRoutes)

export default mainRouter