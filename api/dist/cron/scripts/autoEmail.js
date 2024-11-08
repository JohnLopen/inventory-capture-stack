"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const autoEmailHelpers_1 = require("../auto-email/autoEmailHelpers");
const cronService_1 = require("../../modules/cron/cronService");
const SlackWebhook_1 = require("../../lib/db/slack/SlackWebhook");
(0, dotenv_1.configDotenv)();
(async () => {
    const emailAccount = {
        host: process.env.IMAP_INCOMING_HOST,
        username: process.env.IMAP_USERNAME,
        password: process.env.IMAP_PASSWORD
    };
    const crons = await cronService_1.CronService.getAutoEmails();
    if (!crons)
        return;
    for (const cron of crons) {
        if (!cron.webhook)
            continue;
        const filterSender = {
            from: cron.webhook.user.email
        };
        await (0, autoEmailHelpers_1.scanInbox)(emailAccount, filterSender)
            .catch(error => console.error(error))
            .then(async (results) => {
            if (!results?.length)
                return console.error('No new emails from', cron.webhook?.user.email);
            const msg = results.shift();
            console.log('Auto-scan results', results);
            const slackWebhook = new SlackWebhook_1.SlackWebhook(cron.webhook?.webhook);
            // Send a message with advanced formatting using blocks
            const blocks = [{
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: msg.mailBody
                    }
                }];
            console.log('Posting e-mail message to slack');
            await slackWebhook.postMessage(msg.subject, blocks);
        });
    }
})();
