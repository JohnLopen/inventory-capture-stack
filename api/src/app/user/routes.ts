import { Router } from 'express'
import { UserController } from './userController'

const userRoutes = Router()

// Get users
userRoutes.get('/', UserController.get)

export default userRoutes