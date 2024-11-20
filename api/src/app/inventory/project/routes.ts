import { Router } from 'express'
import { ProjectController } from './projectController'

const projectRoutes = Router()

projectRoutes.get('/', ProjectController.get)
projectRoutes.post('/', ProjectController.postProject)
projectRoutes.get('/:projectId/details', ProjectController.getProject)
projectRoutes.put('/:projectId/update', ProjectController.updateProject)
projectRoutes.get('/count', ProjectController.getCount)

export default projectRoutes