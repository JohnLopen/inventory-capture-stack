"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = __importDefault(require("../modules/user/routes"));
const auth_1 = require("./middlewares/auth");
const mainRouter = (0, express_1.Router)();
// Module routes
// User
mainRouter.use('/users', auth_1.authenticateJWT, routes_1.default);
// External checking endpoint
mainRouter.get("/heartbeat", async (req, res) => {
    res.status(200).send({ status: 'OK' });
});
exports.default = mainRouter;
