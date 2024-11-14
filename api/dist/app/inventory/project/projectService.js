"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const Project_1 = require("./Project");
const date_1 = require("../../../helpers/date");
class ProjectService {
    static async update(data, id) {
        if (!data.updated_at)
            data.updated_at = (0, date_1.now)();
        await new Project_1.Project().update(data, id);
    }
}
exports.ProjectService = ProjectService;
