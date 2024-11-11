import { Request, Response } from 'express'
import { Capture } from './Capture';
import { redisQueue } from '../../../lib/redis/queue';

export class CaptureController {

    /**
     * 
     * @param req 
     * @param resp 
     */
    static async upload(req: Request, res: Response) {
        try {
            let { boxId, projectId } = req.body

            // TODO: Remove in production
            // TEST ONLY
            if (process.env.NODE_ENV == 'development') {
                projectId = 1
                boxId = 1
            }

            // Check file
            if (!req.file || !(req.file as Express.Multer.File).path) {
                throw new Error('No file uploaded')
            }

            const { filename, originalname, path, mimetype, size } = req.file

            const captured: any = await new Capture().create({ filename, originalname, path, mimetype, size })
                .catch(error => {
                    console.trace(error)
                    throw new Error('Unable to insert captured file')
                })

            console.log('captured', captured)
            // await CaptureService.processOcr()

            if (!process.env.CAPTURE_IMAGES_QUEUE) {
                throw ('Failed to process image! Queue name not found in environment.')
            }

            await redisQueue.push(process.env.CAPTURE_IMAGES_QUEUE, { path, captureId: captured.id })

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