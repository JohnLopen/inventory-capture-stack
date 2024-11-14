import { Request, Response } from 'express'
import BaseModel from '../../../lib/db/BaseModel'
import { Project } from './Project'
import { formatDate, now } from '../../../helpers/date'
import { ProjectService } from './projectService'
import { Box } from '../box/Box'
import { CaptureData } from '../capture/CaptureData'

//DO NOT REMOVE
import * as globals from '../../../routes/globals'
import { Part } from '../part/Part'

export class ProjectController {

    static async get(req: Request, res: Response) {
        const { id } = req.user
        console.log('user id', id)
        const projects = await new Project().getWhere(`user_id=${id}`)
        const count = await new BaseModel('project').count(true, { user_id: id })
        res.status(200).json({ projects, count })
    }

    static async getProject(req: Request, res: Response) {
        const { projectId }: any = req.params

        if (!projectId) {
            res.status(500).send({ message: 'Project ID not found' })
            return
        }

        const project = await new Project().find(projectId)
        res.status(200).json(project)
    }

    static async postProject(req: Request, res: Response) {
        const { label }: any = req.body
        const { id } = req.user
        console.log('user id', id)

        if (!label) {
            res.status(500).send({ message: 'Project label is required' })
            return
        }

        const newProject: any = await new Project().create({
            user_id: id,
            label,
            updated_at: now()
        })
        console.log('New project', newProject)
        res.status(200).json({ project: await new Project().find(newProject?.insertId) })
    }

    static async updateProject(req: Request, res: Response) {
        const { label, id }: any = req.body

        if (!label) {
            res.status(500).send({ message: 'Project label is required' })
            return
        }

        await ProjectService.update({ label, updated_at: now() }, id)
        console.log('Project updated',)
        res.status(200).json({})
    }

    static async getCount(req: Request, res: Response) {
        const projects = await new BaseModel('project').count()
        console.log({ projects })
        res.status(200).json({ projects })
    }

    static async view(req: Request, res: Response) {
        const { user } = req.query

        let projects: any = await new Project().getWhere(`user_id=${user}`, true)
        for (let project of projects) {
            project.boxes = await new Box().getWhere(`project_id=${project.id}`)
            console.log('project.boxes', project.boxes)
            project.last_updated = formatDate(project.updated_at, 'lll')

            for (let box of project.boxes) {
                const parts: any = await new Part().getWhere(`box_id=${box.id}`)
                box.parts = parts
                for (const part of parts) {
                    for (let capture of part.captures) {
                        capture.taken_on = formatDate(capture.created_at, 'lll')
                        capture.capture_data = await new CaptureData().findWhere('capture_id', capture.id)
                        if (capture.capture_data?.id) {
                            capture.capture_data.data = JSON.parse(capture.capture_data.data || '{}')
                        }
                        else
                            capture.capture_data = { data: {} }
                        console.log('capture.capture_data', capture.capture_data)
                    }
                }
            }
        }
        // res.status(200).json(projects)
        // return

        res.render('projects', { projects, capture_base: process.env.CAPTURE_BASE_URL });

    }

}