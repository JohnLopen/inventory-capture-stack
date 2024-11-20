"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartController = void 0;
const Part_1 = require("./Part");
class PartController {
    static async get(req, res) {
        const { box_id } = req.query;
        const parts = await new Part_1.Part().getWhere(`box_id=${box_id}`);
        const count = await new Part_1.Part().count(true, { box_id });
        res.status(200).json({ parts, count });
    }
    static async getPart(req, res) {
        const { partId } = req.params;
        if (!partId) {
            res.status(500).send({ message: 'Part ID not found' });
            return;
        }
        const part = await new Part_1.Part().find(partId);
        res.status(200).json(part);
    }
    static async postPart(req, res) {
        const { box_id } = req.body;
        const partModel = new Part_1.Part();
        const parts = await partModel.count();
        if (!box_id) {
            res.status(500).send({ message: 'Box ID is required' });
            return;
        }
        const newPart = await new Part_1.Part().create({
            box_id,
            // send_to_ai: !parts ? 1 : 0,
            label: `Part ${(parts || 0) + 1}`
        });
        console.log('New part', newPart);
        // TODO Update project
        // await ProjectService.update({ updated_at: now() }, boxId)
        res.status(200).json({ part: await partModel.find(newPart?.insertId) });
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
    static async getCount(req, res) {
        res.status(200).json({ parts: await new Part_1.Part().count() });
    }
}
exports.PartController = PartController;
