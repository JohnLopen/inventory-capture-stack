import { configDotenv } from "dotenv";
configDotenv()

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_PROJECT_KEY,
});

export const GPT_DEFAULT_MODEL = 'gpt-4-turbo'; // Use the latest model

class OpenaiLib {
  opts: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

  constructor() {
    configDotenv()
    this.opts = {
      model: process.env.GPT_DEFAULT_MODEL || GPT_DEFAULT_MODEL,
      stream: false,
      messages: [],
      temperature: 0, // Low temperature to get deterministic results
    };
  }

  applyOpts(opt: any) {
    this.opts = { ...this.opts, ...opt };
  }

  // Chat function with part number extraction instruction
  createCompletion(data: any) {
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

    return this._send();
  }

  async _send() {
    console.log('opts', this.opts);
    try {
      const response = await openai.chat.completions.create(this.opts);
      console.log('response', response);

      // Parse response to get valid JSON content
      const parsedResponse = this.parseResponse(response);
      return parsedResponse;
    } catch (e: any) {
      console.error('Error creating completion:', e);
      return e.error ? e.error.message : e.toString();
    }
  }

  parseResponse(response: any) {
    if (!response || !response.choices || response.choices.length === 0) {
      return 'No response received';
    }

    // Get content and parse as JSON, catching errors if any
    const message = response.choices[0].message;
    console.log('Message', message);

    try {
      return JSON.parse(message.content);
    } catch (err) {
      console.error('JSON Parsing Error:', err);
      return 'Error: Response is not valid JSON';
    }
  }
}

export const openaiLib = new OpenaiLib()
