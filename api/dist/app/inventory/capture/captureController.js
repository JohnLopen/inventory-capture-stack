"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureController = void 0;
const Capture_1 = require("./Capture");
const queue_1 = require("../../../lib/redis/queue");
const Box_1 = require("../box/Box");
const projectService_1 = require("../project/projectService");
const date_1 = require("../../../helpers/date");
const Part_1 = require("../part/Part");
class CaptureController {
    static async get(req, res) {
        const { part_id } = req.query;
        const captures = await new Capture_1.Capture().getWhere(`part_id=${part_id}`);
        const count = await new Capture_1.Capture().count(false, { part_id });
        const countSupplemental = await new Capture_1.Capture().count(false, { part_id, is_label_photo: 0 });
        res.status(200).json({ captures, count, countSupplemental });
    }
    /**
     *
     * @param req
     * @param resp
     */
    static async upload(req, res) {
        try {
            let { partId } = req.body;
            const part = await new Part_1.Part().find(partId);
            const box = await new Box_1.Box().find(part?.box_id);
            const captures = await new Capture_1.Capture().count(false, { part_id: partId });
            // Update project
            await projectService_1.ProjectService.update({ updated_at: (0, date_1.now)() }, box.project_id);
            // Check file
            if (!req.file || !req.file.path) {
                throw new Error('No file uploaded');
            }
            const { filename, originalname, path, mimetype, size } = req.file;
            const captured = await new Capture_1.Capture().create({
                is_label_photo: !captures ? 1 : 0,
                filename,
                originalname,
                path,
                mimetype,
                size,
                part_id: partId
            })
                .catch(error => {
                console.trace(error);
                throw new Error('Unable to insert captured file');
            });
            if (!captured?.insertId)
                return;
            if (!captures) {
                // const newCaptureData: any = await new CaptureData().create({ capture_id: captured.insertId })
                if (!process.env.TEXT_ANALYSIS_QUEUE) {
                    throw ('Failed to process image! Queue name not found in environment.');
                }
                await queue_1.redisQueue.push(process.env.TEXT_ANALYSIS_QUEUE, { imagePath: path, captureId: captured.insertId });
                console.log('File uploaded successfully and sent to data extraction queue');
                res.status(200).json({
                    message: 'File uploaded successfully and sent to data extraction queue',
                    file: req.file,
                });
            }
            else {
                console.log('File uploaded successfully');
                res.status(200).json({
                    message: 'File uploaded successfully',
                    file: req.file,
                });
            }
        }
        catch (error) {
            res.status(400).json({
                message: error.message,
                file: req.file,
            });
        }
    }
}
exports.CaptureController = CaptureController;
