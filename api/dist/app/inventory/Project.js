"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const BaseModel_1 = __importDefault(require("../../lib/db/BaseModel"));
class Project extends BaseModel_1.default {
    constructor() {
        super('project');
    }
}
exports.Project = Project;
