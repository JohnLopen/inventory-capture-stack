import BaseModel from "../../../lib/db/BaseModel";
import { Box } from "../box/Box";

export interface Project {
    id?: number;
    name: string;
    deleted_at?: string;
    created_at?: string;
}

export class Project extends BaseModel {
    constructor() {
        super('project')
        this.relationships = {
            'boxes': { type: 'hasMany', foreignKey: 'project_id', model: Box },
        }
    }
}