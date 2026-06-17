/* Structured Output
Structured outputs mean defining the Schema of an output.
Example:
{
    name: string,
    age: number,
    email: string
}
Without structured data:
1. No reliable workflows
2. No automation
3. No agents

Below, you can see how to extract information from unstructured text that conforms to a schema defined in code.
Getting a structured output
*/
import OpenAI from "openai"
import dotenv from "dotenv"
import { string, z } from "zod"
dotenv.config()

// AI INFERENCE USING OPENAI SDK
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim()
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

const CalendarEvent = z.object({
    name: z.string(),
    date: z.string(),
    participants: z.array(z.string())
})

const toolCalendarEvent = (name, date, participants) => {
    return ({
        "name": name,
        "date": date,
        "participants": participants
    })
}

const tools = [
    {
        type: "function",
        function: {
            name: "toolCalendarEvent",
            description: "Extract event",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "the name of the event"
                    },
                    date: {
                        type: "string",
                        description: "the date of the event"
                    },
                    participants: {
                        type: "array",
                        description: "Array of the names of participants"
                    }
                },
                required: ["name", "date", "participants"]
            },
            strict: true
        }
    }
]

const messages = [
    { role: "system", content: "Extract the event information" },
    { role: "user", content: "Alice and Bob are going to a science fair on Friday" }
]

const response = await openai.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages,
    tools,
    tool_choice: "auto"
})

// const toolCall = response.choices[0].message.tool_calls[0]
// const event = toolCall.function.arguments

// const parsed = CalendarEvent.parse(event)
// console.log(parsed)

const assistantMessage = response.choices[0].message
messages.push(assistantMessage)

if (assistantMessage.tool_calls) {
    for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        if (functionName === "toolCalendarEvent") {
            // This block of code is to change an argument data type
            const args = JSON.parse(toolCall.function.arguments);
            if (typeof(args["participants"]) === "string") {
                const cleaned = args["participants"].replace(/'/g, '').replace(/[\[\]]/g, '')
                args["participants"] = cleaned.split(",").map(p => p.trim().replace(/"/g, ""))
            }

            // Final Output
            const parsed = CalendarEvent.parse(args)
            console.log(parsed)

            // 3. Execute the function logic for get_horoscope
            // Irrelevant for Unstructured to structured output for this use case
            // 4. Provide function call results to the model
            // Irrelevant for Unstructured to structured output for this use case
        }
    }
    // 5. The model should be able to give a response!
    // Irrelevant for Unstructured to structured output for this use case
}

/* What I learned from this Lecture
For Unstructured Text -> Structured text
You don't need a second model call at all.
Just extract the arguments from the first tool call

Zod library is used to verify Structured Outputs in a fixed format.
Especially since the output of an object is rearranged to any pattern, zod helps to maintain a fixed pattern.
*/