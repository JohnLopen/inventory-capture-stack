import { configDotenv } from 'dotenv';
configDotenv()

import express, { json, urlencoded } from 'express';
import cors from 'cors';
import path from 'path';
import mainRouter from './routes';


const mainApp = express();

// Set EJS as the template engine
mainApp.set('view engine', 'ejs');
mainApp.set('views', path.join(__dirname, 'views'));  // Assumes views will be in src/views directory

// Middleware for parsing JSON and URL-encoded data with large upload limits
mainApp.use(json({ limit: '50mb' }));
mainApp.use(urlencoded({ extended: true, limit: '50mb' }));

mainApp.use('/uploads', express.static(path.join(__dirname, '../uploads')));
mainApp.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware to enable CORS
mainApp.use(cors());

mainApp.use(mainRouter);

const PORT = 3001;

mainApp.listen(PORT, async () => {
    console.log(`Front-end server is running on port ${PORT}`);
});
