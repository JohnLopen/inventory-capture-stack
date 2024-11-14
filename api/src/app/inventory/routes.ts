import { Router } from 'express'
import captureRoutes from './capture/routes'
import projectRoutes from './project/routes'
import boxRoutes from './box/routes'
import { authenticateJWT } from '../../routes/middlewares/auth'
import partRoutes from './part/routes'

const inventoryRoutes = Router()

inventoryRoutes.use(authenticateJWT)

inventoryRoutes.use('/capture', captureRoutes)
inventoryRoutes.use('/project', projectRoutes)
inventoryRoutes.use('/box', boxRoutes)
inventoryRoutes.use('/part', partRoutes)

export default inventoryRoutes