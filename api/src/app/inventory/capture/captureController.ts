import { Request, Response } from 'express'
import { Capture } from './Capture';
import { redisQueue } from '../../../lib/redis/queue';
import { Box } from '../box/Box';
import { ProjectService } from '../project/projectService';
import { now } from '../../../helpers/date';
import { Part } from '../part/Part';
import { CaptureData } from './CaptureData';

export class CaptureController {

    static async get(req: Request, res: Response) {
        const { part_id } = req.query
        const captures = await new Capture().getWhere(`part_id=${part_id}`)
        const count = await new Capture().count(false, { part_id })
        res.status(200).json({ captures, count })
    }

    /**
     * 
     * @param req 
     * @param resp 
     */
    static async upload(req: Request, res: Response) {
        try {
            let { partId } = req.body
            const part = await new Part().find(partId)
            const box = await new Box().find(part?.box_id)
            const captures: number | null = await new Capture().count(false, { part_id: partId })

            // Update project
            await ProjectService.update({ updated_at: now() }, box.project_id)

            // Check file
            if (!req.file || !(req.file as Express.Multer.File).path) {
                throw new Error('No file uploaded')
            }

            const { filename, originalname, path, mimetype, size } = req.file

            const captured: any = await new Capture().create({
                is_label_photo: !captures ? 1 : 0,
                filename,
                originalname,
                path,
                mimetype,
                size,
                part_id: partId
            })
                .catch(error => {
                    console.trace(error)
                    throw new Error('Unable to insert captured file')
                })

            if (!captured?.insertId)
                return

            if (!captures) {
                // const newCaptureData: any = await new CaptureData().create({ capture_id: captured.insertId })

                if (!process.env.TEXT_ANALYSIS_QUEUE) {
                    throw ('Failed to process image! Queue name not found in environment.')
                }

                await redisQueue.push(process.env.TEXT_ANALYSIS_QUEUE, { imagePath: path, captureId: captured.insertId })

                console.log('File uploaded successfully and sent to data extraction queue')

                res.status(200).json({
                    message: 'File uploaded successfully and sent to data extraction queue',
                    file: req.file,
                });
            }
            else {
                console.log('File uploaded successfully')
                res.status(200).json({
                    message: 'File uploaded successfully',
                    file: req.file,
                });
            }
        }
        catch (error: any) {
            res.status(400).json({
                message: error.message,
                file: req.file,
            });
        }
    }

}