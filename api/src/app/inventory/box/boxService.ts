import { now } from '../../../helpers/date'
import { Box } from './Box'

export class BoxService {

    static async update(data: Record<string, any>, id: number) {
        await new Box().update(data, id)
    }
}