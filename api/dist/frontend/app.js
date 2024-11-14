"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const projectController_1 = require("../app/inventory/project/projectController");
const path_1 = __importDefault(require("path"));
const mainRouter = (0, express_1.Router)();
const mainApp = (0, express_1.default)();
// Set EJS as the template engine
mainApp.set('view engine', 'ejs');
mainApp.set('views', path_1.default.join(__dirname, 'views')); // Assumes views will be in src/views directory
// Middleware to enable CORS
mainApp.use((0, cors_1.default)());
// Main Routes
// External checking endpoint
mainRouter.get("/health", async (req, res) => {
    res.status(200).send({ status: 'OK' });
});
mainRouter.get("/", async (req, res) => {
    res.render('home');
});
mainRouter.get('/projects', projectController_1.ProjectController.view);
mainApp.use(mainRouter);
const PORT = 3001;
mainApp.listen(PORT, async () => {
    console.log(`Front-end server is running on port ${PORT}`);
});
