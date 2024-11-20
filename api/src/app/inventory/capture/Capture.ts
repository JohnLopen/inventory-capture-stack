import BaseModel from "../../../lib/db/BaseModel";
import { CaptureData } from "./CaptureData";

export interface Capture {
    id?: number;
    filename: string;
    originalname: string;
    path: string;
    mimetype: string;
    size: number;
    box_id: number;
    user_id: number;
    deleted_at?: string;
    created_at?: string;
}

export class Capture extends BaseModel {
    constructor() {
        super('capture')

        this.relationships = {
            'capture_data': { type: 'hasOne', foreignKey: 'capture_id', model: CaptureData },
        }
    }
}