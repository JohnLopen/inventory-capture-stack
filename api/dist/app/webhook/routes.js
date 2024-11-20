"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("./webhookController");
const webhookRoutes = (0, express_1.Router)();
// Get webhooks
webhookRoutes.get('/', webhookController_1.WebhookController.get);
exports.default = webhookRoutes;
