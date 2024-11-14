import BaseModel from "../../../lib/db/BaseModel";
import { Capture } from "../capture/Capture";

export interface Part {
    id?: number;
    label: string;
    box_id: number;
    deleted_at?: string;
    created_at?: string;
}

export class Part extends BaseModel {
    constructor() {
        super('part')
        this.relationships = {
            'captures': { type: 'hasMany', foreignKey: 'part_id', model: Capture },
        }
    }
}