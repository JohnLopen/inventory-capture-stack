"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
const BaseModel_1 = __importDefault(require("../../../lib/db/BaseModel"));
const Part_1 = require("../part/Part");
class Box extends BaseModel_1.default {
    constructor() {
        super('box');
        this.relationships = {
            'parts': { type: 'hasMany', foreignKey: 'box_id', model: Part_1.Part },
        };
    }
}
exports.Box = Box;
