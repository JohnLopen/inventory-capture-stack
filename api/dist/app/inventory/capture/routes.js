"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const captureController_1 = require("./captureController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const api_1 = require("../../../routes/middlewares/api");
const captureRoutes = (0, express_1.Router)();
// Guard route with api key
captureRoutes.use(api_1.apiKeyMiddleware);
// Configure Multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_DIR); // folder where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Initialize multer with the storage configuration
const uploader = (0, multer_1.default)({ storage });
// Capture routes
captureRoutes.post('/capture', uploader.single('file'), captureController_1.CaptureController.upload);
exports.default = captureRoutes;
