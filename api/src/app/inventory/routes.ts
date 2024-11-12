import { Router } from 'express'
import captureRoutes from './capture/routes'
import projectRoutes from './project/routes'
import boxRoutes from './box/routes'
import { authenticateJWT } from '../../routes/middlewares/auth'
import { ProjectController } from './project/projectController'

const inventoryRoutes = Router()

inventoryRoutes.get('/', ProjectController.view)

inventoryRoutes.use(authenticateJWT)

inventoryRoutes.use('/capture', captureRoutes)
inventoryRoutes.use('/project', projectRoutes)
inventoryRoutes.use('/box', boxRoutes)

export default inventoryRoutes