/* Tool Calling

 Research link: https://developers.openai.com/api/docs/guides/function-calling
The tool calling flow:
Tool calling is a multi-step conversation between your application and a model via the OpenAI API.
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

// AI INFERENCE USING OPENAI SDK
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim()
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

// 1. Define a list of callable tools for the model
const tools = [
    {
        type: "function",
        function: {
            name: "get_horoscope",
            description: "Get today's horoscope for an astrological sign.",
            parameters: {
                type: "object",
                properties: {
                    sign: {
                        type: "string",
                        description: "An astrological sign like Taurus or Aquarius"
                    }
                },
                required: ["sign"],
                additionalProperties: false
            },
            strict: true
        }
    }
]

const getHoroscope = (sign) => {
    return `${sign}: Next Tuesday you will befriend a baby otter.`
}
// create a running input list we will add to over time
const messages = [
    { role: "user", content: "What is my horoscope? I am an Taurus." }
]
// 2. Prompt the model with tools defined
let firstResponse = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages,
    tools,
    tool_choice: "auto" // auto is 0 or more, required is 1 or more, allowed_tools manually choose the required tools
})
// Preserve model output for the next turn
const assistantMessage = firstResponse.choices[0].message
messages.push(assistantMessage)

if (assistantMessage.tool_calls) {
    for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        if (functionName === "get_horoscope") {
            // 3. Execute the function logic for get_horoscope
            const args = JSON.parse(toolCall.function.arguments);
            const result = getHoroscope(args.sign)

            // 4. Provide function call results to the model
            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: result
            })
        }
    }

    // 5. The model should be able to give a response!
    const finalResponse = await openai.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages,
        tools,
    })
    // console.log("Final output: ")
    console.log(finalResponse.choices[0].message.content)
}


/*
import fs from "fs/promises"
import { exec } from "child_process"

// function: read_file
const readFile = async (path) => {
    return await fs.readFile(path, "utf-8")
}
// function: write_file
const writeFile = async (path, content) => {
    return await fs.writeFile(path, content)
}
// function: bash
const bash = async () => {
    const res = exec("npm test")
    return res.stdout
}
// function: web search
const curl = async (url) => {
    const res = await fetch(url)
    return await res.text()
}
// function: search files
const search_files = async (filename) => {
    const res = exec(`grep ${filename}`)
    return res.stdout
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
                    content: "string"
                },
                required: ["content"]
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
                    
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "curl",
            description: "Search web for updated content",
            parameters: {
                type: "object",
                properties: {
                    
                },
                required: []
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
                    
                },
                required: []
            }
        }
    }
]
*/