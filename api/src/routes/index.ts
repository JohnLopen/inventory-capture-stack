import { Router, Request, Response } from 'express'
import userRoutes from '../app/user/routes'
import { authenticateJWT } from './middlewares/auth'
import authRoutes from '../app/auth/routes'

const mainRouter = Router()

// App routes

// User
mainRouter.use('/auth', authRoutes)
mainRouter.use('/users', authenticateJWT, userRoutes)

// External checking endpoint
mainRouter.get(
    "/heartbeat",
    async (req: Request, res: Response) => {
        res.status(200).send({ status: 'OK' })
    }
)


export default mainRouter