// Build a quick CLI chatbot first so the core request-response pattern is visible before adding UI or storage.
// Checkpoint: explain what belongs in developer instructions versus user messages, then modify the bot so it keeps the last few turns in memory during the process lifetime.
import OpenAI from "openai"
import readline from "readline"
import dotenv from 'dotenv'
dotenv.config()

// console.log([...process.env.OPENAI_BASE_URL].map(c => c.charCodeAt(0)));
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();

// console.log([API_KEY].map(c => c.charCodeAt(0)));
// Setup Openai sdk
const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

const messages = [
    { "role": "developer", "content": "You are a concise helpful assistant." }
]
const rl = readline.createInterface({
    input: process.stdin, output: process.stdout, prompt: 'User: '
})
rl.prompt()
rl.on("line", async (line) => {
    messages.push({
        role: "user",
        content: line
    });

    const response = await client.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages
    });

    const reply = response.choices[0].message.content;

    console.log("Assistant:", reply);

    messages.push({
        role: "assistant",
        content: reply
    });

    rl.prompt();
});