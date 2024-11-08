import BaseModel from "../../lib/db/BaseModel";

export enum AccountType {
    Customer = 'customer',
    Agent = 'agent',
    Administrator = 'administrator'
}

export interface User {
    id?: number;
    name: string;
    internal_name?: string;
    username: string;
    password: string;
    email?: string;
    account_type: AccountType;
    deleted_at?: string;
    created_at?: string;
}

export class User extends BaseModel {
    // table: string = 'user'
    constructor() {
        super('user')
        // this.guarded = ['password']
    }
}