import { now } from '../../../helpers/date'
import { Part } from './Part'

export class BoxService {

    static async update(data: Record<string, any>, id: number) {
        await new Part().update(data, id)
    }
}