export class SlackWebhook {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    async postMessage(message: string, blocks: any[] | null = null): Promise<void> {
        const payload = {
            text: message,
            ...(blocks && { blocks }) // Only include blocks if provided
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Message posted successfully.');
            } else {
                console.error(`Failed to post message: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error posting message:', error);
        }
    }

}
