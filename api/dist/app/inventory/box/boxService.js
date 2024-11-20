"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxService = void 0;
const Box_1 = require("./Box");
class BoxService {
    static async update(data, id) {
        await new Box_1.Box().update(data, id);
    }
}
exports.BoxService = BoxService;
