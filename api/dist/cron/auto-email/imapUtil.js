"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapUtil = void 0;
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
class ImapUtil {
    /**
     *
     * @param imapAccount
     * @param filter
     * @param autoDelete
     */
    constructor(imapAccount, filter, autoDelete = false) {
        this.returnType = 'text';
        this.imapAccount = imapAccount;
        this.filter = filter;
        this.autoDelete = autoDelete;
        const config = {
            user: this.imapAccount.username,
            password: this.imapAccount.password,
            host: this.imapAccount.host,
            port: 993, tls: true,
            tlsOptions: { rejectUnauthorized: false }
        };
        this.imap = new imap_1.default(config);
    }
    /**
     *
     * @returns
     */
    async connectAndScan() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', async () => {
                console.log('Connected to IMAP server', this.imapAccount);
                try {
                    await this.openInbox();
                    const results = await this.search();
                    if (results.length) {
                        const fetchResults = await Promise.all(results.map(seqno => this.fetch(seqno)));
                        await this.expunge();
                        resolve(fetchResults.slice(0, 3).filter(result => !!result));
                    }
                    else {
                        resolve(false);
                    }
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.imap.end();
                }
            });
            this.imap.once('error', (err) => {
                console.error('IMAP connection error:', err);
                reject(err);
            });
            this.imap.once('end', () => {
                console.log('IMAP connection ended.');
            });
            this.imap.connect();
        });
    }
    /**
     *
     * @param mailNum
     * @returns
     */
    async fetch(mailNum) {
        return new Promise((resolve, reject) => {
            const fetch = this.imap.fetch([mailNum], { bodies: '', markSeen: true });
            fetch.on('message', (msg) => {
                msg.on('body', async (stream, info) => {
                    try {
                        const parsed = await (0, mailparser_1.simpleParser)(stream);
                        const mailBody = this.returnType === 'html' ? parsed.html : parsed.text;
                        // Extract email addresses from 'parsed.to' based on its type
                        const toEmails = Array.isArray(parsed.to)
                            ? parsed.to.flatMap(address => address.value.map(addr => addr.address))
                            : parsed.to?.value.map(address => address.address) || [];
                        // Filter out undefined values
                        const validToEmails = toEmails.filter((email) => email !== undefined);
                        console.log(parsed.subject, { to: validToEmails, from: parsed.from?.text, mailBody: mailBody?.toString().length || 0 });
                        // Extract sender
                        if ((this.filter.subject && parsed.subject?.includes(this.filter.subject)) ||
                            (this.filter.from && parsed.from?.text.includes(this.filter.from)) ||
                            (this.filter.to && validToEmails.some(email => email?.includes(this.filter.to)))) {
                            if (this.autoDelete) {
                                this.imap.addFlags(mailNum, '\\Deleted', err => {
                                    if (err)
                                        console.error('Failed to mark email deleted:', err);
                                });
                            }
                            resolve({
                                mailBody,
                                to: validToEmails,
                                from: parsed.from?.text,
                                subject: parsed.subject
                            });
                        }
                        else {
                            reject();
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            fetch.once('error', (err) => {
                reject(err);
            });
            fetch.once('end', () => {
                console.log('Fetch done for message', mailNum);
            });
        });
    }
    /**
     *
     * @returns
     */
    openInbox() {
        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', false, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    /**
     *
     * @returns
     */
    search() {
        return new Promise((resolve, reject) => {
            const filter = [['UNSEEN']];
            if (this.filter.subject)
                filter.push(['SUBJECT', this.filter.subject]);
            if (this.filter.from)
                filter.push(['FROM', this.filter.from]);
            this.imap.search(filter, (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results.sort((a, b) => b - a).slice(0, 1));
            });
        });
    }
    /**
     *
     * @returns
     */
    expunge() {
        return new Promise((resolve, reject) => {
            this.imap.expunge(err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.ImapUtil = ImapUtil;
