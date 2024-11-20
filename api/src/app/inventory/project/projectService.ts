import { Request, Response } from 'express'
import BaseModel from '../../../lib/db/BaseModel'
import { Project } from './Project'
import { now } from '../../../helpers/date'

export class ProjectService {

    static async update(data: Record<string, any>, id: number) {
        if (!data.updated_at)
            data.updated_at = now()

        await new Project().update(data, id)
    }

}