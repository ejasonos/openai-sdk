import dotenv from 'dotenv'
dotenv.config()
import { MongoClient, ServerApiVersion } from 'mongodb'
import readline from "readline"
import OpenAI from "openai"
import { randomBytes } from "crypto"

// DATABASE CONFIGURATION
const uri = process.env.MONGO_URI

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

const run = async () => {
    try {
        // connect the client to the server
        await client.connect()
        // send a ping to confirm a successful connnection
        await client.db("openai-sdk").command({ ping: 1 })
        // console.log("Mongodb connnected successfully")
    } catch (error) {
        throw new Error(error)
    } finally {
        // ensures that the client will close when you finish/error
        await client.close()
    }
}
run().catch(console.dir)

/* Previously in runtime memory we used arrays (memory.push())
Now I want to implement mongodb database to store information
*/
// Save message to database
const saveMessage = async (messageId, conversationId, role, content) => {
    try {
        await client.connect()
        const db = client.db("openai-sdk")
        const collName = 'messages'
        const existing = await db.listCollections({ name: collName }).toArray()
        if (existing.length === 0) {
            await db.createCollection(collName)
            console.log('Created collection: ' + collName)
        }
        const messages = db.collection(collName)
        // insert action
        const result = await messages.insertOne({ msg_Id: messageId, conv_Id: conversationId, role: role, content: content })
        // console.log('Saved messages to db')
    } catch (err) { throw new Error(err) }
    finally { await client.close() }
}
// Load conversation from database
const loadConversation = async (conversationId) => {
    try {
        await client.connect()
        const db = client.db("openai-sdk")
        const collName = 'messages'
        const messages = db.collection(collName)
        // insert action
        const result = await messages.find({ conv_Id: conversationId }).toArray()
        return result
    } catch (e) { throw new Error(e) }
}

// MEMORY ARCHITECTURE
/*
Create 3 collections/tables namely: users, conversation, messages.
The Memory structure below shows the memory hierachy and relationship between the collections. In real-time, they are only connected by the id and not necessary linked to each other.

const memoryStructure = [
    {
        Id: "user_123",
        name: "favour",
        email: "favour@examplemail.org",
        conversation: [
            {
                id: "conv_001",
                userId: "user_123",
                title: "OpenAI SDK Learning",
                messages: [
                    { id: "msg_1", conversationId: "conv_001", role: "user", content: "Who is the author of Things fall Apart" },
                    { id: "msg_2", conversationId: "conv_001", role: "assistant", content: "Wole Soyinka" }
                ]
            },
            {
                id: "conv_002",
                userId: "user_123",
                title: "Javascript Help",
                messages: [
                    {}
                ]
            }
        ],
        unique_char: [
            { userId: "user_123", key: "learning_style", value: "concise" }
        ]
    },
    {
        // user 2
    }
]
*/

// AI INFERENCE USING OPENAI SDK
const API_KEY = process.env.OPENAI_API_KEY?.replace(/[\u200E\u200F\u202A-\u202E]/g, "").trim()
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

// CLI LOOP CONFIGURATION USING READLINE LIBRARY
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "User: "
})

// MAIN CHAT ARCHITECTURE
// Chat loop
/* Flow becomes:
1. User sends message
2. Load history from database
3. Append new message
4. Send to model
5. Save assistant reply
6. Return response
*/
var user_id = "";
var conv_id = "";
var msg_id = "";
var runtimeMemory = [];
rl.prompt()
rl.on('line', async (line) => {
    try {
        // Get input from user
        const prompt = line.toLocaleLowerCase().trim();
        if (user_id.length < 1) {
            user_id = `user_${randomBytes(5).join("")}`
        }
        if (conv_id.length < 1) {
            conv_id = `conv_${randomBytes(5).join("")}`
        }

        // Load history from database
        let getRuntimeMemory = await loadConversation(conv_id)
        if (getRuntimeMemory.length > 1) {
            runtimeMemory = getRuntimeMemory.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        }

        // Append new message
        msg_id = `msg_${randomBytes(5).join("")}`
        await saveMessage(msg_id, conv_id, "user", prompt)

        // Send to model
        const response = openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages: [
                ...runtimeMemory,
                { role: "user", content: prompt }
            ]
        })
        let content = (await response).choices[0].message.content;

        // Save assistant reply
        msg_id = `msg_${randomBytes(5).join("")}`
        await saveMessage(msg_id, conv_id, "assistant", content)

        // Return response
        console.log(content)

        rl.prompt()
    } catch (e) { throw new Error(e) }
})

/* Goals of this lecture:
1. Implement persistent memory structure using mongodb
2. Implement user-specific details (unique characteristics of each user response)
*/