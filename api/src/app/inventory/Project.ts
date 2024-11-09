import BaseModel from "../../lib/db/BaseModel";

export interface Project {
    id?: number;
    name: string;
    deleted_at?: string;
    created_at?: string;
}

export class Project extends BaseModel {
    constructor() {
        super('project')
    }
}