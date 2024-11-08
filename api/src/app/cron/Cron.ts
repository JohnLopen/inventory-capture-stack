import BaseModel from "../../lib/db/BaseModel";
import { Webhook } from "../webhook/Webhook";

export enum CronType {
    AutoEmail = 'auto_email',
}

export interface Cron {
    id?: number;
    webhook_id: number;
    type: CronType;
    deleted_at?: string;
    created_at?: string;
    webhook?: Webhook;
}

export class Cron extends BaseModel {

    constructor() {
        super('cron')
        this.belongsTo(Webhook, 'webhook_id', 'webhook')
    }

}