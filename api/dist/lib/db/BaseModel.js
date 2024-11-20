"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("../../helpers/date");
const mysql2_1 = require("./mysql2");
class BaseModel {
    constructor(table, guardedColumns = []) {
        this.table = '';
        this.primary = 'id';
        this.limit = 0;
        this.guarded = [];
        this.relationships = {};
        this.table = table;
        this.guarded = guardedColumns;
    }
    guard(columns) {
        this.guarded = [...columns];
        return this;
    }
    async getSelectColumns(select = '*') {
        if (select !== '*' || this.guarded.length === 0)
            return select;
        const query = `SHOW COLUMNS FROM ${this.table}`;
        const columns = await this.executeQuery(query);
        const columnsList = columns?.map(col => col.Field);
        const visibleColumns = columnsList?.filter(col => !this.guarded.includes(col));
        return visibleColumns?.join(', ') || '';
    }
    hasOne(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'hasOne', foreignKey, model: relatedModel };
    }
    hasMany(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'hasMany', foreignKey, model: relatedModel };
    }
    belongsTo(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'belongsTo', foreignKey, model: relatedModel };
    }
    async fetchRelationshipsForRow(row) {
        for (const alias in this.relationships) {
            const relationship = this.relationships[alias];
            row[alias] = await this.fetchRelationship(row, relationship);
        }
    }
    async fetchRelationship(row, relationship) {
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
    async executeQuery(sql, params = []) {
        try {
            const [rows] = await mysql2_1.connectionPool.query(sql, params);
            return rows;
        }
        catch (error) {
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
        const rows = await this.executeQuery(query);
        if (rows) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }
    async getWhere(where, skipRelations = false) {
        const selectColumns = await this.getSelectColumns();
        console.log(this.table, selectColumns);
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${where} AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query);
        if (rows && !skipRelations) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }
    async find(id, col) {
        const selectColumns = await this.getSelectColumns();
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${col ?? this.primary} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query, [id]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    async findWhere(column, value, select = '*') {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${column} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query, [value]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    async findRaw(where, select = '*') {
        const selectColumns = await this.getSelectColumns(select);
        const query = `
            SELECT ${selectColumns} FROM ${this.table}
            WHERE ${where} AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    async findByForeignKey(value, foreignKey) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${foreignKey} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query, [value]);
        return rows ? rows[0] : null;
    }
    async findAllByForeignKey(value, foreignKey) {
        const selectColumns = await this.getSelectColumns();
        const query = `SELECT ${selectColumns} FROM ${this.table} WHERE ${foreignKey} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query, [value]);
        return rows || [];
    }
    async delete(id) {
        const query = `
            UPDATE ${this.table}
            SET deleted_at = ?
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [(0, date_1.now)(), id]);
    }
    async create(data) {
        data.created_at = (0, date_1.now)();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.values(data).map(() => '?').join(', ');
        const query = `
            INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
        `;
        return await this.executeQuery(query, Object.values(data));
    }
    async update(data, id) {
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const query = `
            UPDATE ${this.table}
            SET ${updates}
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [...Object.values(data), id]);
    }
    async count(withTrashed = false, params) {
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
        const rows = await this.executeQuery(query, Object.values(params || {}));
        // Return the count if available, otherwise null
        return rows && rows[0] ? rows[0].count : null;
    }
}
exports.default = BaseModel;
