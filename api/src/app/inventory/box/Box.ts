import BaseModel from "../../../lib/db/BaseModel";
import { Part } from "../part/Part";

export interface Box {
    id?: number;
    label: string;
    project_id: number;
    deleted_at?: string;
    created_at?: string;
}

export class Box extends BaseModel {
    constructor() {
        super('box')
        this.relationships = {
            'parts': { type: 'hasMany', foreignKey: 'box_id', model: Part },
        }
    }
}