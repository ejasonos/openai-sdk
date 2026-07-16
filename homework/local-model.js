// Build a quick CLI chatbot first so the core request-response pattern is visible before adding UI or storage.
// Checkpoint: explain what belongs in developer instructions versus user messages, then modify the bot so it keeps the last few turns in memory during the process lifetime.
import OpenAI from "openai"
import readline from "readline"

// console.log([...process.env.OPENAI_BASE_URL].map(c => c.charCodeAt(0)));
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();

/* =================================================
/*     SIMPLE CHATBOT WITH PERSISTENT MEMORY
====================================================*/
const client = new OpenAI({
    apiKey: "sai-ollama",
    baseURL: "http://localhost:11434/v1"
})

const messages = [
    { role: "developer", content: "You are a Proffessional assistant." },
    { role: "system", content: "Don't use ** in your output because it is not a markdown output." }
]

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'User: '
})

rl.prompt()
rl.on('line', async (line) => {
    const prompt = line;

    const stream = await client.chat.completions.create({
        model: "llama3.1:8b",
        messages: [
            ...messages,
            { role: "User", content: prompt }
        ],
        stream: true
    });

    for await (const chunk of stream) {
        const delta =
            chunk.choices?.[0]?.delta?.content;

        if (delta) {
            process.stdout.write(delta)
        }
    }

    rl.prompt();
})
