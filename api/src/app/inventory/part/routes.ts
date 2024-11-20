import { Router } from 'express'
import { PartController } from './partController'

const partRoutes = Router()

partRoutes.get('/', PartController.get)
partRoutes.post('/', PartController.postPart)
partRoutes.get('/:boxId/details', PartController.getPart)
partRoutes.get('/count', PartController.getCount)

export default partRoutes