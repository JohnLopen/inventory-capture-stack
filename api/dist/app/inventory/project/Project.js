"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const BaseModel_1 = __importDefault(require("../../../lib/db/BaseModel"));
const Box_1 = require("../box/Box");
class Project extends BaseModel_1.default {
    constructor() {
        super('project');
        this.relationships = {
            'boxes': { type: 'hasMany', foreignKey: 'project_id', model: Box_1.Box },
        };
    }
}
exports.Project = Project;
