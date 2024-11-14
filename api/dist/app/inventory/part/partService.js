"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxService = void 0;
const Part_1 = require("./Part");
class BoxService {
    static async update(data, id) {
        await new Part_1.Part().update(data, id);
    }
}
exports.BoxService = BoxService;
