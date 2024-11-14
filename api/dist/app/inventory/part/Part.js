"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Part = void 0;
const BaseModel_1 = __importDefault(require("../../../lib/db/BaseModel"));
const Capture_1 = require("../capture/Capture");
class Part extends BaseModel_1.default {
    constructor() {
        super('part');
        this.relationships = {
            'captures': { type: 'hasMany', foreignKey: 'part_id', model: Capture_1.Capture },
        };
    }
}
exports.Part = Part;
