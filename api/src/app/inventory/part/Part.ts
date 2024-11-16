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
            'label_capture': { type: 'hasOne', foreignKey: 'part_id', model: Capture, filter: { 'is_label_photo': 1 } },
            'supplement_captures': { type: 'hasMany', foreignKey: 'part_id', model: Capture, filter: { 'is_label_photo': 0 } },
        }
    }
}