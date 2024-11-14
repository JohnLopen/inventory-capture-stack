"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxController = void 0;
const BaseModel_1 = __importDefault(require("../../../lib/db/BaseModel"));
const Box_1 = require("./Box");
const projectService_1 = require("../project/projectService");
const date_1 = require("../../../helpers/date");
const boxService_1 = require("./boxService");
class BoxController {
    static async get(req, res) {
        const { project_id } = req.query;
        const boxes = await new Box_1.Box().getWhere(`project_id=${project_id}`);
        const count = await new Box_1.Box().count(true, { project_id });
        res.status(200).json({ boxes, count });
    }
    static async getBox(req, res) {
        const { boxId } = req.params;
        if (!boxId) {
            res.status(500).send({ message: 'Box ID not found' });
            return;
        }
        const box = await new Box_1.Box().find(boxId);
        res.status(200).json(box);
    }
    static async postBox(req, res) {
        const { label, project_id } = req.body;
        if (!label) {
            res.status(500).send({ message: 'Box label is required' });
            return;
        }
        const newBox = await new Box_1.Box().create({ project_id, label });
        console.log('New box', newBox);
        // Update project
        await projectService_1.ProjectService.update({ updated_at: (0, date_1.now)() }, project_id);
        res.status(200).json({ box: await new Box_1.Box().find(newBox?.insertId) });
    }
    static async updateBox(req, res) {
        const { label, id } = req.body;
        if (!label) {
            res.status(500).send({ message: 'Box label is required' });
            return;
        }
        const box = await new Box_1.Box().find(id);
        await boxService_1.BoxService.update({ label }, id);
        await projectService_1.ProjectService.update({ updated_at: (0, date_1.now)() }, box.project_id);
        console.log('Box updated');
        res.status(200).json({});
    }
    static async getCount(req, res) {
        const boxes = await new BaseModel_1.default('box').count();
        console.log({ boxes });
        res.status(200).json({ boxes });
    }
}
exports.BoxController = BoxController;
