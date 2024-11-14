"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const mainApp = (0, express_1.default)();
// Set EJS as the template engine
mainApp.set('view engine', 'ejs');
mainApp.set('views', 'src/views'); // Assumes views will be in src/views directory
// Middleware to enable CORS
mainApp.use((0, cors_1.default)());
// Middleware to log every request
mainApp.use((0, morgan_1.default)('combined'));
// Middleware for parsing JSON and URL-encoded data with large upload limits
mainApp.use((0, body_parser_1.json)({ limit: '50mb' }));
mainApp.use((0, body_parser_1.urlencoded)({ extended: true, limit: '50mb' }));
// Main Routes
mainApp.use(routes_1.default);
// Serve static files from the 'uploads' directory
mainApp.use('/images', express_1.default.static(path_1.default.join(__dirname, 'public/images')));
// Serve static files from the 'uploads' directory
mainApp.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
exports.default = mainApp;
