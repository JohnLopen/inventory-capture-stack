import { now } from '../../helpers/date';
import { connectionPool } from './mysql2';

class BaseModel {
    table: string = '';
    primary: string = 'id';
    limit: number = 0;
    // Guarded columns to exclude from results
    guarded: string[] = [];

    // Define relationships
    relationships: Record<string, { type: 'hasOne' | 'hasMany' | 'belongsTo', foreignKey: string, model: typeof BaseModel }> = {};

    constructor(table: string, guardedColumns: string[] = []) {
        this.table = table;
        this.guarded = guardedColumns;
    }

    public guard(columns: string[]) {
        this.guarded = [...columns]
        return this
    }

    // Method to construct SELECT statement, excluding guarded columns
    private async getSelectColumns(select: string = '*'): Promise<string> {
        if (select !== '*' || this.guarded.length === 0) return select;

        // Fetch column names from the table
        const query = `SHOW COLUMNS FROM ${this.table}`;
        const columns = await this.executeQuery<any[]>(query);
        const columnsList = columns?.map(col => col.Field);

        // Exclude guarded columns
        const visibleColumns = columnsList?.filter(col => !this.guarded.includes(col));
        return visibleColumns?.join(', ') || '';
    }

    /**
     * Define a relationship.
     */
    hasOne(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'hasOne', foreignKey, model: relatedModel };
    }

    hasMany(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'hasMany', foreignKey, model: relatedModel };
    }

    belongsTo(relatedModel: typeof BaseModel, foreignKey: string, alias: string) {
        this.relationships[alias] = { type: 'belongsTo', foreignKey, model: relatedModel };
    }

    // Fetch related data for a row based on defined relationships
    private async fetchRelationshipsForRow(row: any) {
        for (const alias in this.relationships) {
            const relationship = this.relationships[alias];
            row[alias] = await this.fetchRelationship(row, relationship);
        }
    }

    // Fetch relationship data based on type
    private async fetchRelationship(row: any, relationship: { type: string, foreignKey: string, model: typeof BaseModel }) {
        const relatedModel = new relationship.model(relationship.model.prototype.table);
        const foreignKeyValue = row[relationship.foreignKey];

        if (!foreignKeyValue) return relationship.type === 'hasMany' ? [] : null;

        switch (relationship.type) {
            case 'hasOne':
                return await relatedModel.findByForeignKey(foreignKeyValue);
            case 'hasMany':
                return await relatedModel.findAllByForeignKey(foreignKeyValue);
            case 'belongsTo':
                return await relatedModel.find(foreignKeyValue);
            default:
                return null;
        }
    }

    // Execute query with error handling
    private async executeQuery<T>(sql: string, params: any[] = []): Promise<T | null> {
        try {
            const [rows] = await connectionPool.query<any>(sql, params);
            return rows;
        } catch (error) {
            console.error(`Database error in query: ${sql}`, error);
            return null;
        }
    }

    // Get all records with relationships and guarded columns applied
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

    // Get records with specific conditions and relationships
    async getWhere(where: string) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${where} AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query);
        if (rows) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }

    // Find a record by primary key or specified column with relationships
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

    // Find a record by column value with relationships
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

    // Find a record with custom raw conditions and relationships
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

    // Find a single record by a foreign key
    async findByForeignKey(value: any) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${this.primary} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query, [value]);
        return rows ? rows[0] : null;
    }

    // Find multiple records by a foreign key
    async findAllByForeignKey(value: any) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${this.primary} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery<any[]>(query, [value]);
        return rows || [];
    }

    // Soft delete a record by updating deleted_at
    async delete(id: number) {
        const query = `
            UPDATE ${this.table}
            SET deleted_at = ?
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [now(), id]);
    }

    // Create a new record
    async create(data: Record<string, any>) {
        data.created_at = now();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.values(data).map(() => '?').join(', ');
        const query = `
            INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
        `;
        return await this.executeQuery(query, Object.values(data));
    }

    // Update a record by primary key
    async update(data: Record<string, any>, id: number) {
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const query = `
            UPDATE ${this.table}
            SET ${updates}
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [...Object.values(data), id]);
    }
}

export default BaseModel;
