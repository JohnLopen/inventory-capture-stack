import { Router } from 'express'
import captureRoutes from './capture/routes'
import projectRoutes from './project/routes'
import boxRoutes from './box/routes'
import { authMiddleware } from '../../routes/middlewares/auth'
import partRoutes from './part/routes'

const inventoryRoutes = Router()

inventoryRoutes.use(authMiddleware)

inventoryRoutes.use('/capture', captureRoutes)
inventoryRoutes.use('/project', projectRoutes)
inventoryRoutes.use('/box', boxRoutes)
inventoryRoutes.use('/part', partRoutes)

export default inventoryRoutes