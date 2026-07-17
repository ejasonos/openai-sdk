/* Retrieval & External Knowledge: Embeddings, Vector Search, RAG
// Stage 2: Local Embeddings
/*
Why local embeddings: because they are cheap mathematically but expensive operationally at scale
Running local embeddings is normal. Even production companies do this.

Create Embedding Service:
*/
console.log('Checkpoint 0.0')
import { ConvBertForQuestionAnswering, pipeline } from "@xenova/transformers"
const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
);
export async function createEmbedding(text) {
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true
    })
    return Array.from(output.data)
}
console.log('checkpoint 0.1')
// What this does: Text -> Transformer Model -> Vector
const context1 = {
    document: "Node.js",// is a Javascript runtime",
    vector: await createEmbedding("Node.js is a Javascript runtime")
}
const context2 = {
    document: "Bamidele ",//is a 19 year old Nigerian. Working hard to earn a living in Software programming. In this age of AI, Bamidele's future has been greatly threatened.",
    vector: await createEmbedding("Bamidele is a 19 year old Nigerian. Working hard to earn a living in Software programming. In this age of AI, Bamidele's future has been greatly threatened.")
}

// Stage 5: ChromaDB connection
// Connect chroma
// Directory: chroma/client.js
console.log('Checkpoint 1')
import { ChromaClient } from "chromadb";
export const chroma = new ChromaClient({
    host: "localhost",
    port: 8000
})
// Create Collection
const collection = await chroma.createCollection({
  name: "documents"
});
console.log('Checkpoint 2')
// const collection = await chroma.getCollection({
//     name: "documents",
//     embeddingFunction: createEmbedding
// })
// Store Embeddings
await collection.add({
    ids: ["1", "2"],
    documents: [
        context1.document, context2.document
    ],
    embeddings: [context1.vector, context2.vector],
    metadatas: [
        {
            title: "Nodejs.pdf",
            category: "runtime"
        },
        {
            title: "Software development",
            category: "NEWS"
        }
    ]
})
console.log('Checkpoint 3')
//What chroma stores: id, document, Embedding vector, Metadata

/* Stage 6: Semantic Retrieval
In this step, the user asks a question and the question is converted to a vector that chroma uses to search from its chromadb (database).
Step 1: Embed query
*/
const prompt = "Tell me about Bamidele"
const queryVector = await createEmbedding(prompt)
// Step 2: Search Chroma
const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 3
})
console.log('Checkpoint 4')
await console.log("Results from chromadb vector search: " + results)

// Stage 7: Chat completions
import OpenAI from 'openai'
const client = new OpenAI({
    apiKey: "sai-ollama",
    baseURL: "http://localhost:11434/v1"
})
console.log('Checkpoint 5')
/* Build RAG Prompt
const context = results//.documents[0].join("\n\n")


const stream = await client.chat.completions.create({
    model: "llama3.1:8b",
    messages: [
        { role: "system", content: "Use the provided context to answer the Question accurately." },
        { role: "user", content: `Content: ${context} Question: ${prompt}` }
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
/**/