import { Request, Response } from 'express'
import BaseModel from '../../../lib/db/BaseModel'
import { Part } from './Part'

export class PartController {

    static async get(req: Request, res: Response) {
        const { box_id } = req.query
        const parts = await new Part().getWhere(`box_id=${box_id}`)
        const count = await new Part().count(true, { box_id })
        res.status(200).json({ parts, count })
    }

    static async getPart(req: Request, res: Response) {
        const { partId }: any = req.params
        if (!partId) {
            res.status(500).send({ message: 'Part ID not found' })
            return
        }

        const part = await new Part().find(partId)
        res.status(200).json(part)
    }

    static async postPart(req: Request, res: Response) {
        const { box_id }: any = req.body
        const partModel = new Part()
        const parts: number | null = await partModel.count(false, { box_id })

        if (!box_id) {
            res.status(500).send({ message: 'Box ID is required' })
            return
        }

        const newPart: any = await new Part().create({
            box_id,
            // send_to_ai: !parts ? 1 : 0,
            label: `Part ${(parts || 0) + 1}`
        })
        console.log('New part', newPart)

        // TODO Update project
        // await ProjectService.update({ updated_at: now() }, boxId)

        res.status(200).json({ part: await partModel.find(newPart?.insertId) })
    }

    // static async updateBox(req: Request, res: Response) {
    //     const { label, id }: any = req.body

    //     if (!label) {
    //         res.status(500).send({ message: 'Box label is required' })
    //         return
    //     }
    //     const box = await new Part().find(id)

    //     await BoxService.update({ label }, id)
    //     await ProjectService.update({ updated_at: now() }, box.boxId)

    //     console.log('Box updated',)

    //     res.status(200).json({})
    // }

    static async getCount(req: Request, res: Response) {
        res.status(200).json({ parts: await new Part().count() })
    }

}