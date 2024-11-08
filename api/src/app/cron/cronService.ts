import { Cron, CronType } from './Cron'

export class CronService {

    /**
     * 
     * @returns Cron[]
     */
    static async getAutoEmails() {
        const allAutoEmails = await new Cron().getWhere(`type='${CronType.AutoEmail}'`)
        return allAutoEmails
    }

}