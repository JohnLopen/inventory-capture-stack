import { Capture } from "./Capture";

export class CaptureService {

    /**
     * 
     * @param req 
     * @param resp 
     */
    static getCapture(captureId: number) {
        return new Capture().find(captureId)
    }

}