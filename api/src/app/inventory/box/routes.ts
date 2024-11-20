import { Router } from 'express'
import { BoxController } from './boxController'

const boxRoutes = Router()

boxRoutes.get('/', BoxController.get)
boxRoutes.post('/', BoxController.postBox)
boxRoutes.get('/:boxId/details', BoxController.getBox)
boxRoutes.put('/:boxId/update', BoxController.updateBox)
boxRoutes.get('/count', BoxController.getCount)

export default boxRoutes