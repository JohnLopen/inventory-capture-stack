import { configDotenv } from 'dotenv';
configDotenv()

import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import { ProjectController } from '../app/inventory/project/projectController';
import path from 'path';

const mainRouter = Router();

const mainApp = express();

// Set EJS as the template engine
mainApp.set('view engine', 'ejs');
mainApp.set('views', path.join(__dirname, 'views'));  // Assumes views will be in src/views directory

// Middleware to enable CORS
mainApp.use(cors());

// Main Routes
// External checking endpoint
mainRouter.get(
    "/health",
    async (req: Request, res: Response) => {
        res.status(200).send({ status: 'OK' })
    }
)

mainRouter.get(
    "/",
    async (req: Request, res: Response) => {
        res.render('home');
    }
)

mainRouter.get('/projects', ProjectController.view)

mainApp.use(mainRouter);

const PORT = 3001;

mainApp.listen(PORT, async () => {
    console.log(`Front-end server is running on port ${PORT}`);
});
