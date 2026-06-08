/* Tool calling is a multi-step conversation between your application and a model via the OpenAI API.
1. Make a request to the model with tools it could call
2. Receive a tool call from the model
3. Execute code on the application side with input from the tool call
4. Make a second request to the model with the tool output
5. Receive a final response from the model (or more tool calls)

Simply put:
You send a prompt to a model along with tools that you've correctly listed.
The model's response contains the tools it requires for the operation.
You then check for the tools it requires and give it instructions on what to do next
It will carryout those instructions and send a final response.
Note: You could keep on going about sending and refining the responses.
*/
/* Function tool example
Let's look at an end-to-end tool calling flow for a get_horoscope function that gets a daily horoscope for an astrological sign
*/
import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()
import { exec } from "child_process"
import fs from "fs/promises"
import readline from "readline"

// AI INFERENCE USING OPENAI SDK
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim()
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

// Configure tools for OpenAI SDK
const read_file = async (filename) => {
    return await fs.readFile(filename, "utf-8")
}

const tools = [
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Read file",
            parameters: {
                type: "object",
                properties: {
                    filename: {
                        type: "string",
                        description: "The filename of the file to read"
                    }
                },
                required: ["filename"]
            },
            strict: false
        }
    }
]

// Start Whale loop
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "User: "
})

var messages = [
    { role: "system", content: "You are a verbose assistant for metaphysical advice." }
]
rl.prompt()
rl.on('line', async (line) => {
    const prompt = line.toLowerCase().trim()
    messages.push({ role: "user", content: prompt })
    try {

        const firstResponse = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages,
            tools,
            tool_choice: "auto"
        })

        const assistantMessage = await firstResponse.choices[0].message
        messages.push(assistantMessage)

        if (assistantMessage.tool_calls) {
            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function.name
                if (functionName === "read_file") {
                    // 3. Get the variables for the specific tool call from the response of the model
                    const args = JSON.parse(toolCall.function.arguments)
                    const result = await read_file(args.filename)
                    // 4. Send the executed function to the model
                    messages.push({ role: "tool", tool_call_id: toolCall.id, content: result })
                }
            }
            const finalResponse = await openai.chat.completions.create({
                model: "meta/llama-3.1-8b-instruct",
                messages,
                tools
            })
            console.log(finalResponse.choices[0].message.content)
        }

        const alternateResponse = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages,
            tools
        })
        console.log(alternateResponse.choices[0].message.content)
    } catch (err) {
        console.error(err)
    } finally {
        rl.prompt()
    }
})