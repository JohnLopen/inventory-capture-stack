"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = __importDefault(require("./capture/routes"));
const inventoryRoutes = (0, express_1.Router)();
// Capture routes
inventoryRoutes.use('/capture', routes_1.default);
exports.default = inventoryRoutes;
