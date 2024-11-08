"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanInbox = void 0;
const imapUtil_1 = require("./imapUtil");
/**
 * Scans the inbox for emails with specified sender or subject
 */
const scanInbox = async (imapAccount, filter, autoDelete = false) => {
    try {
        const imapUtil = new imapUtil_1.ImapUtil(imapAccount, filter, autoDelete);
        const results = await imapUtil.connectAndScan()
            .catch(error => {
            throw error;
        });
        return results;
    }
    catch (error) {
        // console.error('Error in scanInbox function:', error);
        throw error;
    }
};
exports.scanInbox = scanInbox;
