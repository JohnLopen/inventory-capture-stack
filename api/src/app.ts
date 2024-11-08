// src/app.ts
import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import mainRouter from './routes';

const mainApp = express();

// Middleware to enable CORS
mainApp.use(cors());

// Middleware to log every request
mainApp.use(morgan('combined'));

// Middleware for parsing JSON and URL-encoded data with large upload limits
mainApp.use(json({ limit: '50mb' }));
mainApp.use(urlencoded({ extended: true, limit: '50mb' }));

// Main Routes
mainApp.use(mainRouter);

export default mainApp;
