import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY =
  process.env.OPENAI_API_KEY
    ?.replace(/[\u200E\u200F\u202A-\u202E]/g, "")
    .trim();

const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

const stream = await client.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
        { role: "system", content: "You are Steve Jobs in 2026."},
        { role: "user", content: "Explain streaming responses in one paragraph."}
    ],
    stream: true
});

for await (const chunk of stream) {
    const delta =
      chunk.choices?.[0]?.delta?.content;

    if (delta) {
        process.stdout.write(delta);
    }
}

/* WHAT I LEARNED FROM THIS LECTURE: LECTURE 1
1. Legacy code for streaming chat responses
*/