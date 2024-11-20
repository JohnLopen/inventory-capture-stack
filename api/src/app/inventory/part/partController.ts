import { Request, Response } from 'express'
import { Part } from './Part'

export class PartController {

    static async get(req: Request, res: Response) {
        const { box_id } = req.query
        const parts: any = await new Part().getWhere(`box_id=${box_id}`)
        for (const part of parts) {
            part.captures = []
            if (part.label_capture?.id)
                part.captures.push(part.label_capture)
            if (part.supplement_captures?.length)
                part.captures = part.captures.concat(part.supplement_captures)
        }

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

        res.status(200).json({ part: await partModel.find(newPart?.insertId) })
    }

    static async getCount(req: Request, res: Response) {
        res.status(200).json({ parts: await new Part().count() })
    }

}