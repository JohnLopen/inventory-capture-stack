import { Router } from 'express'
import { CaptureController } from './captureController'
import multer from 'multer';
import path from 'path';
import { apiKeyMiddleware } from '../../../routes/middlewares/api';

const captureRoutes = Router()

// Guard route with api key
// captureRoutes.use(apiKeyMiddleware)

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_DIR!); // folder where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// Initialize multer with the storage configuration
const uploader = multer({ storage });

// Capture routes
captureRoutes.post('/', uploader.single('file'), CaptureController.upload)

export default captureRoutes