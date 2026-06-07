// Build a quick CLI chatbot first so the core request-response pattern is visible before adding UI or storage.
// Checkpoint: explain what belongs in developer instructions versus user messages, then modify the bot so it keeps the last few turns in memory during the process lifetime.
import OpenAI from "openai"
import readline from "readline"

// console.log([...process.env.OPENAI_BASE_URL].map(c => c.charCodeAt(0)));
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim();


/* =================================================
/*          SIMPLE CHATBOT
====================================================*/
// Setup Openai sdk
// const client = new OpenAI({
//     apiKey: API_KEY,
//     baseURL: process.env.OPENAI_BASE_URL
// })

// const messages = [
//     { role: "system", content: "You are a nutritional doctor-grade assistant." }
// ]

// const rl = readline.createInterface({
//     input: process.stdin, output: process.stdout, prompt: 'User: '
// })
// rl.prompt()
// rl.on("line", async (line) => {
//     const prompt = line.trim();

//     const response = await client.chat.completions.create({
//         model: "meta/llama-3.1-8b-instruct",
//         messages: [{role: "user", content: prompt}]
//     });

//     console.log("Nutrition AI: "+response.choices[0].message.content);

//     rl.prompt();
// });

/* =================================================
/*     SIMPLE CHATBOT WITH PERSISTENT MEMORY
====================================================*/
const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

const messages = [
    {role: "developer", content: "You are a frisbee Proffessional assistant."},
    {role: "system", content: "Don't use ** in your output because it is not a markdown file."}
]

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'User: '
})

rl.prompt()
rl.on('line', async (line)=> {
    const prompt = line;

    const response = await client.chat.completions.create({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
            {role: "user", content: prompt},
            ...messages
        ]
    })

    console.log("Frisbee AI: "+response.choices[0].message.content);

    // Runtime memory
    const memory = response.choices[0].message.content;
    messages.push({role: "assistant", content: memory})

    rl.prompt();
})

/* WHAT I LEARNED FROM THIS LECTURE: LECTURE 1
1. I had problems running the codebase, it was a complete mess.
2. I had character encoding problems that took out my whole day. I resolved it around 4:30PM
3. I had dotenv issues. Having always used frameworks recently I had forgotten about installing and loading the package.
4. I was able to write the codebase myself and how I wanted it.
5. I can't wait to start streaming responses.
6. I couldn't make use of the responses.output_text because nvidia endpoint allows chat/completions. I really hope this is not a blow to my learning.
7. I learned how to use the readline package. I worked it out from a Nodejs pdf and AI assistance.
8. I returned to correct the code: where messages.push({role: ...}). The role was formerly user but I changed it to assistant!
9. I returned to correct the comment "Persistent memory" to "Runtime memory"
*/