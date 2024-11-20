import { now } from '../../helpers/date';
import { connectionPool } from './mysql2';

export interface Relationship {
    type: 'hasOne' | 'hasMany' | 'belongsTo';
    foreignKey: string;
    model: typeof BaseModel;
    filter?: Record<string, any>;
}

class BaseModel {
    table: string = '';
    primary: string = 'id';
    limit: number = 0;
    guarded: string[] = [];

    relationships: Record<string, Relationship> = {};

    constructor(table: string, guardedColumns: string[] = []) {
        this.table = table;
        this.guarded = guardedColumns;
    }

    public guard(columns: string[]) {
        this.guarded = [...columns];
        return this;
    }

    private async getSelectColumns(select: string = '*'): Promise<string> {
        if (select !== '*' || this.guarded.length === 0) return select;

        const query = `SHOW COLUMNS FROM ${this.table}`;
        const columns = await this.executeQuery<any[]>(query);
        const columnsList = columns?.map(col => col.Field);

        const visibleColumns = columnsList?.filter(col => !this.guarded.includes(col));
        return visibleColumns?.join(', ') || '';
    }

    hasOne(relatedModel: typeof BaseModel, foreignKey: string, alias: string, filter?: Record<string, any>) {
        this.relationships[alias] = { type: 'hasOne', foreignKey, model: relatedModel, filter };
    }

    hasMany(relatedModel: typeof BaseModel, foreignKey: string, alias: string, filter?: Record<string, any>) {
        this.relationships[alias] = { type: 'hasMany', foreignKey, model: relatedModel, filter };
    }

    belongsTo(relatedModel: typeof BaseModel, foreignKey: string, alias: string, filter?: Record<string, any>) {
        this.relationships[alias] = { type: 'belongsTo', foreignKey, model: relatedModel, filter };
    }

    private async fetchRelationshipsForRow(row: any) {
        for (const alias in this.relationships) {
            const relationship = this.relationships[alias];
            row[alias] = await this.fetchRelationship(row, relationship);
        }
    }

    private async fetchRelationship(row: any, relationship: Relationship) {
        const relatedModel = new relationship.model(relationship.model.prototype.table);

        const baseFilter: Record<string, any> = {};
        if (relationship.type === 'hasOne' || relationship.type === 'hasMany') {
            baseFilter[relationship.foreignKey] = row[this.primary];
        } else if (relationship.type === 'belongsTo') {
            baseFilter[this.primary] = row[relationship.foreignKey];
        }

        // Combine base filter with the relationship's filter
        const combinedFilter = { ...baseFilter, ...relationship.filter };
        const whereClause = Object.keys(combinedFilter)
            .map(key => `${key} = ?`)
            .join(' AND ');
        const whereParams = Object.values(combinedFilter);

        switch (relationship.type) {
            case 'hasOne':
                return await relatedModel.findRaw(whereClause, '*', whereParams);
            case 'hasMany':
                return await relatedModel.getWhere(whereClause, whereParams);
            case 'belongsTo':
                return await relatedModel.findRaw(whereClause, '*', whereParams);
            default:
                return null;
        }
    }

    private async executeQuery<T>(sql: string, params: any[] = []): Promise<T | null> {
        try {
            const [rows] = await connectionPool.query<any>(sql, params);
            return rows;
        } catch (error) {
            console.error(`Database error in query: ${sql}`, error);
            return null;
        }
    }

    async get() {
        const selectColumns = await this.getSelectColumns();
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE deleted_at IS NULL
            ${this.limit ? `LIMIT ${this.limit}` : ''}
        `;
        const rows = await this.executeQuery<any[]>(query);
        if (rows) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }

    async getWhere(where: string, params: any[] = [], skipRelations: boolean = false) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${where} AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query, params);
        if (rows && !skipRelations) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }

    async find(id: number, col?: string) {
        const selectColumns = await this.getSelectColumns();
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${col ?? this.primary} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery<any[]>(query, [id]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }

    async findRaw(where: string, select: string = '*', params: any[] = []) {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${where} AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery<any[]>(query, params);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }

    async findWhere(column: string, value: any, select: string = '*') {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${column} = ? AND deleted_at IS NULL
            LIMIT 1
        `;
        const rows: any[] | null = await this.executeQuery<any[]>(query, [value]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }

    async findByForeignKey(value: any, foreignKey: string) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${foreignKey} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query, [value]);
        return rows ? rows[0] : null;
    }

    async findAllByForeignKey(value: any, foreignKey: string) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${foreignKey} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query, [value]);
        return rows || [];
    }

    async delete(id: number) {
        const query = `
            UPDATE ${this.table}
            SET deleted_at = ?
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [now(), id]);
    }

    async create(data: Record<string, any>) {
        data.created_at = now();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.values(data).map(() => '?').join(', ');
        const query = `
            INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
        `;
        return await this.executeQuery(query, Object.values(data));
    }

    async update(data: Record<string, any>, id: number) {
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const query = `
            UPDATE ${this.table}
            SET ${updates}
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [...Object.values(data), id]);
    }

    async count(withTrashed: boolean = false, params?: Record<string, any>): Promise<number | null> {
        let query = `SELECT COUNT(*) as count FROM ${this.table} WHERE TRUE`;
        if (!withTrashed) {
            query += ' AND deleted_at IS NULL';
        }
        if (params) {
            query += Object.keys(params)
                .map(key => ` AND ${key} = ?`)
                .join('');
        }
        const rows = await this.executeQuery<{ count: number }[]>(query, Object.values(params || {}));
        return rows && rows[0] ? rows[0].count : null;
    }
}

export default BaseModel;
