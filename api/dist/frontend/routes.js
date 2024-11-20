"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../app/inventory/project/projectController");
const captureController_1 = require("../app/inventory/capture/captureController");
const auth_1 = require("../routes/middlewares/auth");
const mainRouter = (0, express_1.Router)();
// Main Routes
// External checking endpoint
mainRouter.get("/health", async (req, res) => {
    res.status(200).send({ status: 'OK' });
});
mainRouter.get("/", async (req, res) => {
    res.render('home');
});
mainRouter.use(auth_1.authMiddleware);
mainRouter.get('/:user/projects', projectController_1.ProjectController.viewUserProjects);
mainRouter.get('/:user/projects/:projectId/boxes', projectController_1.ProjectController.viewProjectBoxes);
mainRouter.get('/capture/:captureId', captureController_1.CaptureController.getCapture);
mainRouter.post('/capture/:captureId', captureController_1.CaptureController.postCaptureData);
mainRouter.post('/capture/:captureId/rotate', captureController_1.CaptureController.postRotateCapture);
exports.default = mainRouter;
