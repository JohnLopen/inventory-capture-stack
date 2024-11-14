"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sevenDaysAgo = exports.formatDate = exports.now = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// Return current date & time
const now = (format) => (0, moment_timezone_1.default)().tz('America/Los_Angeles').format(format || 'Y-MM-DD HH:mm:s');
exports.now = now;
// Reformat
const formatDate = (dt, format) => (0, moment_timezone_1.default)(dt).format(format || 'Y-MM-DD HH:mm:s');
exports.formatDate = formatDate;
// Return the date 7 days ago
const sevenDaysAgo = (format) => (0, moment_timezone_1.default)().tz('America/Los_Angeles').subtract(7, 'days').format(format || 'Y-MM-DD HH:mm:s');
exports.sevenDaysAgo = sevenDaysAgo;
