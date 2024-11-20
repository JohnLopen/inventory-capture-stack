"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("./authController");
const authRoutes = (0, express_1.Router)();
// Get users
authRoutes.post('/login', authController_1.AuthController.login);
exports.default = authRoutes;
