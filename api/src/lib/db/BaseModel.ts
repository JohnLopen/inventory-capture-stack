import { now } from '../../helpers/date';
import { connectionPool } from './mysql2';

class BaseModel {
    table: string = '';
    primary: string = 'id';
    limit: number = 0;
    guarded: string[] = [];

    relationships: Record<string, { type: 'hasOne' | 'hasMany' | 'belongsTo', foreignKey: string, model: typeof BaseModel }> = {};

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

    hasOne(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'hasOne', foreignKey, model: relatedModel };
    }

    hasMany(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'hasMany', foreignKey, model: relatedModel };
    }

    belongsTo(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'belongsTo', foreignKey, model: relatedModel };
    }

    private async fetchRelationshipsForRow(row: any) {
        for (const alias in this.relationships) {
            const relationship = this.relationships[alias];
            row[alias] = await this.fetchRelationship(row, relationship);
        }
    }

    private async fetchRelationship(row: any, relationship: { type: string, foreignKey: string, model: typeof BaseModel }) {
        const relatedModel = new relationship.model(relationship.model.prototype.table);
        // const foreignKeyValue = row[relationship.foreignKey];

        // if (!foreignKeyValue) return relationship.type === 'hasMany' ? [] : null;

        switch (relationship.type) {
            case 'hasOne':
                return await relatedModel.findByForeignKey(row.id, relationship.foreignKey);
            case 'hasMany':
                return await relatedModel.findAllByForeignKey(row.id, relationship.foreignKey);
            case 'belongsTo':
                return await relatedModel.findWhere(relationship.foreignKey, row.id);
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

    async getWhere(where: string, skipRelations: boolean = false) {
        const selectColumns = await this.getSelectColumns();
        console.log(this.table, selectColumns)
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${where} AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query);
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

    async findWhere(column: string, value: any, select: string = '*') {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${column} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery<any[]>(query, [value]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }

    async findRaw(where: string, select: string = '*') {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${where} AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery<any[]>(query);
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
        // Start building the base query
        let query = `SELECT COUNT(*) as count FROM ${this.table} WHERE TRUE`;

        // Add condition for trashed records if needed
        if (!withTrashed) {
            query += ' AND deleted_at IS NULL';
        }

        // Add conditions from params if they are provided
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                // Dynamically add conditions to the query for each param
                // Assuming 'value' is safe for the query or is properly sanitized
                query += ` AND ${key} = ?`;
            }
        }

        // Execute the query with parameters
        const rows = await this.executeQuery<{ count: number }[]>(query, Object.values(params || {}));

        // Return the count if available, otherwise null
        return rows && rows[0] ? rows[0].count : null;
    }

}

export default BaseModel;
