"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const BaseModel_1 = __importDefault(require("../../../lib/db/BaseModel"));
const Project_1 = require("./Project");
const date_1 = require("../../../helpers/date");
const projectService_1 = require("./projectService");
const Box_1 = require("../box/Box");
const CaptureData_1 = require("../capture/CaptureData");
const Part_1 = require("../part/Part");
class ProjectController {
    static async get(req, res) {
        const { id } = req.user;
        console.log('user id', id);
        const projects = await new Project_1.Project().getWhere(`user_id=${id}`);
        const count = await new BaseModel_1.default('project').count(true, { user_id: id });
        res.status(200).json({ projects, count });
    }
    static async getProject(req, res) {
        const { projectId } = req.params;
        if (!projectId) {
            res.status(500).send({ message: 'Project ID not found' });
            return;
        }
        const project = await new Project_1.Project().find(projectId);
        res.status(200).json(project);
    }
    static async postProject(req, res) {
        const { label } = req.body;
        const { id } = req.user;
        console.log('user id', id);
        if (!label) {
            res.status(500).send({ message: 'Project label is required' });
            return;
        }
        const newProject = await new Project_1.Project().create({
            user_id: id,
            label,
            updated_at: (0, date_1.now)()
        });
        console.log('New project', newProject);
        res.status(200).json({ project: await new Project_1.Project().find(newProject?.insertId) });
    }
    static async updateProject(req, res) {
        const { label, id } = req.body;
        if (!label) {
            res.status(500).send({ message: 'Project label is required' });
            return;
        }
        await projectService_1.ProjectService.update({ label, updated_at: (0, date_1.now)() }, id);
        console.log('Project updated');
        res.status(200).json({});
    }
    static async getCount(req, res) {
        const projects = await new BaseModel_1.default('project').count();
        console.log({ projects });
        res.status(200).json({ projects });
    }
    static async view(req, res) {
        const { user } = req.query;
        let projects = await new Project_1.Project().getWhere(`user_id=${user}`, true);
        for (let project of projects) {
            project.boxes = await new Box_1.Box().getWhere(`project_id=${project.id}`);
            console.log('project.boxes', project.boxes);
            project.last_updated = (0, date_1.formatDate)(project.updated_at, 'lll');
            for (let box of project.boxes) {
                const parts = await new Part_1.Part().getWhere(`box_id=${box.id}`);
                box.parts = parts;
                for (const part of parts) {
                    for (let capture of part.captures) {
                        capture.taken_on = (0, date_1.formatDate)(capture.created_at, 'lll');
                        capture.capture_data = await new CaptureData_1.CaptureData().findWhere('capture_id', capture.id);
                        if (!capture.is_label_photo) {
                            capture.capture_data = { data: {} };
                            continue;
                        }
                        if (capture.capture_data?.id) {
                            const parsedData = JSON.parse(capture.capture_data.data || '{}');
                            if (capture.capture_data.status == 'success')
                                capture.capture_data.data = parsedData;
                            else {
                                capture.capture_data.data = { mpn: capture.capture_data.status.replace('_', ' ') };
                            }
                        }
                        else
                            capture.capture_data = { data: { mpn: 'pending' } };
                        console.log('capture.capture_data', capture.capture_data);
                    }
                }
            }
        }
        // res.status(200).json(projects)
        // return
        res.render('projects', { projects, capture_base: process.env.CAPTURE_BASE_URL });
    }
}
exports.ProjectController = ProjectController;
