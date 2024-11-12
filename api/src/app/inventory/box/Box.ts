import BaseModel from "../../../lib/db/BaseModel";
import { Capture } from "../capture/Capture";

export interface Box {
    id?: number;
    label: string;
    user_id: number;
    deleted_at?: string;
    created_at?: string;
}

export class Box extends BaseModel {
    constructor() {
        super('box')
        this.relationships = {
            'captures': { type: 'hasMany', foreignKey: 'box_id', model: Capture },
        }
    }
}