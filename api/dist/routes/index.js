"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_1 = __importDefault(require("../app/user/routes"));
const auth_1 = require("./middlewares/auth");
const routes_2 = __importDefault(require("../app/auth/routes"));
const routes_3 = __importDefault(require("../app/inventory/routes"));
const mainRouter = (0, express_1.Router)();
// App routes
// User
mainRouter.use('/auth', routes_2.default);
mainRouter.use('/users', auth_1.authenticateJWT, routes_1.default);
// External checking endpoint
mainRouter.get("/heartbeat", async (req, res) => {
    res.status(200).send({ status: 'OK' });
});
// Inventory routes
mainRouter.use('/inventory', routes_3.default);
exports.default = mainRouter;
