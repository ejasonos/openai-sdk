/* OUTCOME OF THE TEST
1. The model was connected successfully without internet, and it returned a response.
2. This shows that OpenAI SDK routes with a simple fetch() method
3. The model never makes use of the tool_calls options
4. The model is too small (270M parameters) for the persistent memory setup compared with gpt3 (175B parameters)
*/
import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()
import readline from "readline"
import { z } from "zod"
// Libraries for tools
import fs from "fs/promises"
import { exec } from "child_process"

// Configure the OpenAI SDK
// Transform encoding of key (a bug)
const API_KEY = process.env.OPENAI_API_KEY
    ?.replace(/[\u200E\u200F\u202A-\u202E]/g, "")
    .trim();
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "http://localhost:5000/v1"
})

// Create tools
// function: read_file
const read_file = async (path) => {
    return await fs.readFile(path, "utf-8")
}
// function: write_file
const write_file = async (path, content) => {
    return await fs.writeFile(path, content)
}
// function: bash
const bash = async (cmd, path) => {
    return new Promise((res, rej) => {
        exec(`${cmd} ${path}`, (err, stdout) => {
            if (err) { rejects(err); return; }
            res(stdout);
        })
    })
}
// function: web search
const web_search = async (query) => {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`)
    const data = await res.json()
    return data
}
// function: search files
const search_files = async (path) => {
    return new Promise((res, rej) => {
        exec(`grep -R "${path}" .`, (err, stdout) => {
            if (err) { rej(err); return; }
            res(stdout);
        })
    })
}

const tools = [
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Read a file",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Content of the specified filepath"
                    }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "write_file",
            description: "Create a file",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                    },
                    content: {
                        type: "string",
                        description: "Content to be written"
                    }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "bash",
            description: "run cli command in bash shell",
            parameters: {
                type: "object",
                properties: {
                    cmd: {
                        type: "string",
                        description: "bash command"
                    },
                    path: {
                        type: "string",
                        description: "Parameter for command"
                    }
                },
                required: ["cmd", "path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Search web for updated content",
            parameters: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "Response form the url"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_files",
            description: "Search directories for files",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Path to search for"
                    }
                },
                required: ["path"]
            }
        }
    }
]

// Make a query to the model and see how it uses the tools
const messages = [
    { role: "system", content: "You are a talkative friend who knows about midnight stories" }
]

// Prepare loop for conversation
const rl = readline.createInterface({
    input: process.stdin, output: process.stdout, prompt: "User: "
})

rl.prompt()
rl.on('line', async (line) => {
    const prompt = line.toLowerCase().trim()

    const firstResponse = await openai.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
            ...messages,
            {role: "user", content: prompt}
        ],
        tools,
        tool_choice: "auto"
    })

    const assistantMessage = await firstResponse.choices[0].message
    messages.push(assistantMessage)

    if (assistantMessage.tool_calls) {
        for (const toolCall of assistantMessage.tool_calls) {
            const functionName = toolCall.function.name
            if (functionName === "read_file") { console.log("read_file() called")}
            if (functionName === "write_file") { console.log("write_file() called")}
            if (functionName === "bash") { console.log("bash() called")}
            if (functionName === "web_search") { console.log("web_search() called")}
            if (functionName === "search_files") { console.log("search_files() called")}
        }
        console.log("Assistant message tool calls used"+assistantMessage.tool_calls)
    }
    console.log("AI: "+assistantMessage.content)
    rl.prompt()
})
