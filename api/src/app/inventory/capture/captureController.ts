import { Request, Response } from 'express'
import { Capture } from './Capture';
import { redisQueue } from '../../../lib/redis/queue';
import BaseModel from '../../../lib/db/BaseModel';
import { Box } from '../box/Box';
import { ProjectService } from '../project/projectService';
import { now } from '../../../helpers/date';

export class CaptureController {

    static async get(req: Request, res: Response) {
        const { box_id } = req.query
        const captures = await new Capture().getWhere(`box_id=${box_id}`)
        const count = await new BaseModel('capture').count(true, { box_id })
        res.status(200).json({ captures, count })
    }

    /**
     * 
     * @param req 
     * @param resp 
     */
    static async upload(req: Request, res: Response) {
        try {
            let { boxId } = req.body
            const box = await new Box().find(boxId)

            // Update project
            await ProjectService.update({ updated_at: now() }, box.project_id)

            // Check file
            if (!req.file || !(req.file as Express.Multer.File).path) {
                throw new Error('No file uploaded')
            }

            const { filename, originalname, path, mimetype, size } = req.file

            const captured: any = await new Capture().create({ filename, originalname, path, mimetype, size, box_id: boxId })
                .catch(error => {
                    console.trace(error)
                    throw new Error('Unable to insert captured file')
                })

            console.log('captured', captured)
            // await CaptureService.processOcr()

            if (!process.env.CAPTURE_IMAGES_QUEUE) {
                throw ('Failed to process image! Queue name not found in environment.')
            }

            await redisQueue.push(process.env.CAPTURE_IMAGES_QUEUE, { path, captureId: captured.insertId, boxId })

            res.status(200).json({
                message: 'File uploaded successfully and sent to extraction queue for data extraction',
                file: req.file,
            });
        }
        catch (error: any) {
            res.status(400).json({
                message: error.message,
                file: req.file,
            });
        }
    }

}