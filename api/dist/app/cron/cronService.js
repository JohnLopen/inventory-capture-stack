"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const Cron_1 = require("./Cron");
class CronService {
    /**
     *
     * @returns Cron[]
     */
    static async getAutoEmails() {
        const allAutoEmails = await new Cron_1.Cron().getWhere(`type='${Cron_1.CronType.AutoEmail}'`);
        return allAutoEmails;
    }
}
exports.CronService = CronService;
