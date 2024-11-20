"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = __importDefault(require("./capture/routes"));
const routes_2 = __importDefault(require("./project/routes"));
const routes_3 = __importDefault(require("./box/routes"));
const auth_1 = require("../../routes/middlewares/auth");
const routes_4 = __importDefault(require("./part/routes"));
const inventoryRoutes = (0, express_1.Router)();
inventoryRoutes.use(auth_1.authenticateJWT);
inventoryRoutes.use('/capture', routes_1.default);
inventoryRoutes.use('/project', routes_2.default);
inventoryRoutes.use('/box', routes_3.default);
inventoryRoutes.use('/part', routes_4.default);
exports.default = inventoryRoutes;
