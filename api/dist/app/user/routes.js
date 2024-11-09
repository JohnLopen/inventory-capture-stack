"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("./userController");
const userRoutes = (0, express_1.Router)();
// Get users
userRoutes.get('/', userController_1.UserController.get);
exports.default = userRoutes;
