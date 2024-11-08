import { Router } from 'express'
import { AuthController } from './authController'

const authRoutes = Router()

// Get users
authRoutes.post('/login', AuthController.login)

export default authRoutes