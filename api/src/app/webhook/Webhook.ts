import BaseModel from "../../lib/db/BaseModel";
import { User } from "../user/User";

export enum WebhookProvider {
    Slack = 'slack',
}

export enum WebhookType {
    AutoEmail = 'auto_email',
}

export interface Webhook {
    id?: number;
    user_id: number;
    provider: WebhookProvider;
    webhook: string;
    type: WebhookType;
    user: User;
    deleted_at?: string;
    created_at?: string;
}

export class Webhook extends BaseModel {
    constructor() {
        super('webhook')
        this.belongsTo(User, 'user_id', 'user')
    }
}