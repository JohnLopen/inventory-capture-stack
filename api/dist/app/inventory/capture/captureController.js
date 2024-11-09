"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureController = void 0;
const Capture_1 = require("./Capture");
class CaptureController {
    /**
     *
     * @param req
     * @param resp
     */
    static async upload(req, res) {
        try {
            // Check file
            if (!req.file || !req.file.path) {
                throw new Error('No file uploaded');
            }
            const { filename, originalname, path, mimetype, size } = req.file;
            const captured = await new Capture_1.Capture().create({ filename, originalname, path, mimetype, size })
                .catch(error => {
                console.trace(error);
                throw new Error('Unable to insert captured file');
            });
            console.log('captured', captured);
            // await CaptureService.processOcr()
            res.status(200).json({
                message: 'File uploaded successfully',
                file: req.file,
            });
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
