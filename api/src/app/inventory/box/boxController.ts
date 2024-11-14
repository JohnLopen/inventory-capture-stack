import { Request, Response } from 'express'
import BaseModel from '../../../lib/db/BaseModel'
import { Box } from './Box'
import { ProjectService } from '../project/projectService'
import { now } from '../../../helpers/date'
import { BoxService } from './boxService'

export class BoxController {

    static async get(req: Request, res: Response) {
        const { project_id } = req.query
        const boxes = await new Box().getWhere(`project_id=${project_id}`)
        const count = await new Box().count(true, { project_id })
        res.status(200).json({ boxes, count })
    }

    static async getBox(req: Request, res: Response) {
        const { boxId }: any = req.params

        if (!boxId) {
            res.status(500).send({ message: 'Box ID not found' })
            return
        }

        const box = await new Box().find(boxId)
        res.status(200).json(box)
    }

    static async postBox(req: Request, res: Response) {
        const { label, project_id }: any = req.body

        if (!label) {
            res.status(500).send({ message: 'Box label is required' })
            return
        }

        const newBox: any = await new Box().create({ project_id, label })
        console.log('New box', newBox)

        // Update project
        await ProjectService.update({ updated_at: now() }, project_id)

        res.status(200).json({ box: await new Box().find(newBox?.insertId) })
    }

    static async updateBox(req: Request, res: Response) {
        const { label, id }: any = req.body

        if (!label) {
            res.status(500).send({ message: 'Box label is required' })
            return
        }
        const box = await new Box().find(id)

        await BoxService.update({ label }, id)
        await ProjectService.update({ updated_at: now() }, box.project_id)

        console.log('Box updated',)

        res.status(200).json({})
    }

    static async getCount(req: Request, res: Response) {
        const boxes = await new BaseModel('box').count()
        console.log({ boxes })
        res.status(200).json({ boxes })
    }

}