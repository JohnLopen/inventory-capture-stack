import { Request, Response } from 'express'
import { Capture } from './Capture';

export class CaptureController {

    /**
     * 
     * @param req 
     * @param resp 
     */
    static async upload(req: Request, res: Response) {
        try {
            // Check file
            if (!req.file || !(req.file as Express.Multer.File).path) {
                throw new Error('No file uploaded')
            }

            const { filename, originalname, path, mimetype, size } = req.file

            const captured = await new Capture().create({ filename, originalname, path, mimetype, size })
                .catch(error => {
                    console.trace(error)
                    throw new Error('Unable to insert captured file')
                })

            console.log('captured', captured)
            // await CaptureService.processOcr()

            res.status(200).json({
                message: 'File uploaded successfully',
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