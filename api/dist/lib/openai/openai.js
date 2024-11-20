"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiLib = exports.GPT_DEFAULT_MODEL = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_PROJECT_KEY,
});
exports.GPT_DEFAULT_MODEL = 'gpt-4-turbo'; // Use the latest model
class OpenaiLib {
    constructor() {
        (0, dotenv_1.configDotenv)();
        this.opts = {
            model: process.env.GPT_DEFAULT_MODEL || exports.GPT_DEFAULT_MODEL,
            stream: false,
            messages: [],
            temperature: 0, // Low temperature to get deterministic results
        };
    }
    applyOpts(opt) {
        this.opts = { ...this.opts, ...opt };
    }
    // Chat function with part number extraction instruction
    async createCompletion(data) {
        const { role, content } = data;
        // Append strict JSON instruction to the content
        const instruction = `
    Extract all electronic part numbers and return in JSON format with each part formatted as:
    {
        "part_number": "<part number>",
        "ordered_quantity": <quantity>,
        "shipped": <quantity>
    }
    Ensure JSON output only. Do not include any extra characters outside JSON.
    `;
        const newContent = `${content}\n${instruction}`;
        this.applyOpts({ messages: [{ role, content: newContent }] });
        const response = await this._send();
        return { ...response, aiCompletion: this.opts };
    }
    async _send() {
        console.log('opts', this.opts);
        try {
            const response = await openai.chat.completions.create(this.opts);
            console.log('response', response);
            // Parse response to get valid JSON content
            const parsedData = this.parseResponse(response);
            return { parsedData, aiResponse: response };
        }
        catch (e) {
            console.error('Error creating completion:', e);
            return e.error ? e.error.message : e.toString();
        }
    }
    parseResponse(response) {
        if (!response || !response.choices || response.choices.length === 0) {
            return 'No response received';
        }
        // Get content and parse as JSON, catching errors if any
        const message = response.choices[0].message;
        console.log('Message', message);
        try {
            return JSON.parse(message.content);
        }
        catch (err) {
            console.error('JSON Parsing Error:', err);
            return 'Error: Response is not valid JSON';
        }
    }
}
exports.openaiLib = new OpenaiLib();
