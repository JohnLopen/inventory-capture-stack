import { Request, Response } from 'express'
import { Capture } from './Capture';
import { redisQueue } from '../../../lib/redis/queue';
import { Box } from '../box/Box';
import { ProjectService } from '../project/projectService';
import { now } from '../../../helpers/date';
import { Part } from '../part/Part';
import { CaptureData } from './CaptureData';
import { CaptureService } from './captureService';
import { getImageDimensions, rotateImageInPlace } from '../../../helpers/image';

export class CaptureController {

    static async get(req: Request, res: Response) {
        const { part_id } = req.query
        const captures = await new Capture().getWhere(`part_id=${part_id}`)
        const count = await new Capture().count(false, { part_id })
        const countSupplemental = await new Capture().count(false, { part_id, is_label_photo: 0 })
        res.status(200).json({ captures, count, countSupplemental })
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

    /**
     * 
     * @param req 
     * @param res 
     */
    static async getCapture(req: Request, res: Response) {
        const { captureId }: any = req.params
        const capture = await CaptureService.getCapture(captureId)
        const dimension = await getImageDimensions(capture.path)
        const part = await new Part().find(capture.part_id)
        res.status(200).json({ capture, part, dimension })
    }

    static async postCaptureData(req: Request, res: Response) {
        const { captureId }: any = req.params
        console.log({ captureId, data: req.body })
        const captureDataModel = new CaptureData()
        const captureData = await captureDataModel.findWhere('capture_id', captureId)

        if (captureData?.id)
            await captureDataModel.update({ status: 'edited', data: JSON.stringify(req.body) }, captureData?.id)
        else
            await captureDataModel.create({ capture_id: captureId, data: JSON.stringify(req.body), status: 'edited' })

        res.status(200).json({})
    }

    static async postRotateCapture(req: Request, res: Response) {
        const { captureId, clockwise }: any = req.params
        const capture = await new Capture().find(captureId)
        await rotateImageInPlace(capture.path, Boolean(clockwise))
            .then(() => {
                res.status(200).json({})
            })
            .catch((error) => {
                console.error({ error, captureId, clockwise })
                res.status(500).json({ error: 'Unable to rotate image' })
            })
    }

}