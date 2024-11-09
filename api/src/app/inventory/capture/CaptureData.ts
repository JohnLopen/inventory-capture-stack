import BaseModel from "../../../lib/db/BaseModel";

export interface CaptureData {
    id?: number;
    part_number: string;
    data: string;
    deleted_at?: string;
    created_at?: string;
}

export class CaptureData extends BaseModel {
    constructor() {
        super('capture_data')
    }
}