import { Router, Request, Response } from "express";
import { ProjectController } from "../app/inventory/project/projectController";
import { CaptureController } from "../app/inventory/capture/captureController";
import { authMiddleware } from "../routes/middlewares/auth";

const mainRouter = Router();

// Main Routes
// External checking endpoint
mainRouter.get(
    "/health",
    async (req: Request, res: Response) => {
        res.status(200).send({ status: 'OK' })
    }
)

mainRouter.get(
    "/",
    async (req: Request, res: Response) => {
        res.render('home');
    }
)

mainRouter.get(
    "/login",
    async (req: Request, res: Response) => {
        res.render('login');
    }
)

mainRouter.get('/projects', ProjectController.viewUserProjects)
mainRouter.post('/projects', authMiddleware, ProjectController.viewUserProjects)

mainRouter.get('/projects/:projectId/boxes', ProjectController.viewProjectBoxes)
mainRouter.post('/projects/:projectId/boxes', authMiddleware, ProjectController.viewProjectBoxes)

mainRouter.get('/capture/:captureId', authMiddleware, CaptureController.getCapture)
mainRouter.post('/capture/:captureId', authMiddleware, CaptureController.postCaptureData)
mainRouter.post('/capture/:captureId/rotate', authMiddleware, CaptureController.postRotateCapture)

export default mainRouter