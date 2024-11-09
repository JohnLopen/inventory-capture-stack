import BaseModel from "../../lib/db/BaseModel";

export interface Box {
    id?: number;
    name: string;
    deleted_at?: string;
    created_at?: string;
}

export class Box extends BaseModel {
    constructor() {
        super('box')
    }
}