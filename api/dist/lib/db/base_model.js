"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("../../helpers/date");
const mysql2_1 = require("./mysql2");
class BaseModel {
    constructor(table) {
        this.table = '';
        this.primary = 'id';
        this.limit = 0;
        // Define relationships
        this.relationships = {};
        this.table = table;
    }
    /**
     * Define a hasOne relationship.
     */
    hasOne(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'hasOne', foreignKey, model: relatedModel };
    }
    /**
     * Define a hasMany relationship.
     */
    hasMany(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'hasMany', foreignKey, model: relatedModel };
    }
    /**
     * Define a belongsTo relationship.
     */
    belongsTo(relatedModel, foreignKey, alias) {
        this.relationships[alias] = { type: 'belongsTo', foreignKey, model: relatedModel };
    }
    /**
     * Fetch related data for a given row based on defined relationships.
     */
    async fetchRelationshipsForRow(row) {
        for (const alias in this.relationships) {
            const relationship = this.relationships[alias];
            row[alias] = await this.fetchRelationship(row, relationship);
        }
    }
    /**
     * Fetch relationship data based on type.
     */
    async fetchRelationship(row, relationship) {
        const relatedModel = new relationship.model(relationship.model.prototype.table);
        const foreignKeyValue = row[relationship.foreignKey];
        if (!foreignKeyValue)
            return relationship.type === 'hasMany' ? [] : null;
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
    /**
     * Execute query with error handling.
     */
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
    /**
     * Get all records with relationships.
     */
    async get() {
        const query = `
            SELECT * FROM ${this.table}
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
    /**
     * Get records with specific conditions and relationships.
     */
    async getWhere(where) {
        const query = `SELECT * FROM ${this.table} WHERE ${where} AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query);
        if (rows) {
            for (const row of rows) {
                await this.fetchRelationshipsForRow(row);
            }
        }
        return rows;
    }
    /**
     * Find a record by primary key or specified column with relationships.
     */
    async find(id, col) {
        const query = `
            SELECT * FROM ${this.table}
            WHERE ${col ?? this.primary} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query, [id]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    /**
     * Find a record by column value with relationships.
     */
    async findWhere(column, value, select = '*') {
        const query = `
            SELECT ${select} FROM ${this.table}
            WHERE ${column} = ? AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query, [value]);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    /**
     * Find a record with custom raw conditions with relationships.
     */
    async findRaw(where, select = '*') {
        const query = `
            SELECT ${select} FROM ${this.table}
            WHERE ${where} AND deleted_at IS NULL
        `;
        const rows = await this.executeQuery(query);
        if (rows && rows[0]) {
            await this.fetchRelationshipsForRow(rows[0]);
        }
        return rows ? rows[0] : null;
    }
    /**
     * Find a single record by a foreign key.
     */
    async findByForeignKey(value) {
        const query = `SELECT * FROM ${this.table} WHERE ${this.primary} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query, [value]);
        return rows ? rows[0] : null;
    }
    /**
     * Find multiple records by a foreign key.
     */
    async findAllByForeignKey(value) {
        const query = `SELECT * FROM ${this.table} WHERE ${this.primary} = ? AND deleted_at IS NULL`;
        const rows = await this.executeQuery(query, [value]);
        return rows || [];
    }
    /**
     * Soft delete a record by updating deleted_at.
     */
    async delete(id) {
        const query = `
            UPDATE ${this.table}
            SET deleted_at = ?
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [(0, date_1.now)(), id]);
    }
    /**
     * Create a new record.
     */
    async create(data) {
        data.created_at = (0, date_1.now)();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.values(data).map(() => '?').join(', ');
        const query = `
            INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})
        `;
        return await this.executeQuery(query, Object.values(data));
    }
    /**
     * Update a record by primary key.
     */
    async update(data, id) {
        const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const query = `
            UPDATE ${this.table}
            SET ${updates}
            WHERE ${this.primary} = ?
        `;
        return await this.executeQuery(query, [...Object.values(data), id]);
    }
}
exports.default = BaseModel;
