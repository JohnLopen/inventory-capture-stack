import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mainRouter from './routes';

const mainApp = express();

// Set EJS as the template engine
mainApp.set('view engine', 'ejs');
mainApp.set('views', 'src/views');  // Assumes views will be in src/views directory

// Middleware to enable CORS
mainApp.use(cors());

// Middleware to log every request
mainApp.use(morgan('combined'));

// Middleware for parsing JSON and URL-encoded data with large upload limits
mainApp.use(json({ limit: '50mb' }));
mainApp.use(urlencoded({ extended: true, limit: '50mb' }));

// Main Routes
mainApp.use(mainRouter);

// Serve static files from the 'uploads' directory
mainApp.use('/images', express.static(path.join(__dirname, 'public/images')));

// Serve static files from the 'uploads' directory
mainApp.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default mainApp;
