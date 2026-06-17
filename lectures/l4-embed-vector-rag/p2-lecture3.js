/* Retrieval & External Knowledge: Embeddings, Vector Search, RAG

Stack: Nodejs, MySQL, ChromaDB, OpenAI SDK, NVIDIA Chat Completions, Local Embeddings
RAG System architecture: Documents -> Chunking -> Embeddings -> Vector Search -> Similarity Search -> Inject Relevant Context -> LLM Response

What is an Embedding: an embedding is a text -> numbers. These numbers mathematically represent semantic meaning.
Vector Search: Vectors allow similarity comparison. The find semantically related meaning.
ChromaDB: stores vectors efficiently and retrieves nearest matches.

Note: Embeddings are not sent to the LLM, only retreived text.
*/

/* Stage 1: Embeddings
npm install openai mysql2 chromadb @xenova/transformers dotenv
FOLDER STRUCTURE: 
project/
  db/
  embeddings/
  rag/
  chroma/
  services/
  app.js
  .env
Setup Environment: 
NVIDIA_API_KEY=..
MYSQL_URL=mysql://root:password@localhost/ragdb
Install ChromaDB: docker run -p 8000:8000 chromadb/chroma
*/

// Stage 2: Local Embeddings
/*
Why local embeddings: because they are cheap mathematically but expensive operationally at scale
Running local embeddings is normal. Even production companies do this.

Create Embedding Service:
*/
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
// What this does: Text -> Transformer Model -> Vector
const context1 = {
  document: "Node.js is a Javascript runtime",
  vector: await createEmbedding("Node.js is a Javascript runtime")
}
const context2 = {
  document: "Bamidele is a 19 year old Nigerian. Working hard to earn a living in Software programming. In this age of AI, Bamidele's future has been greatly threatened.",
  vector: await createEmbedding("Bamidele is a 19 year old Nigerian. Working hard to earn a living in Software programming. In this age of AI, Bamidele's future has been greatly threatened.")
}
// Stage 3: MySQL Setup
/*
What MySQL does: it stores original documents, metadata, ownership, timestamps (NOT VECTORS primarily)
Create Database and table:
CREATE DATABASE ragdb;
CREATE TABLE documents(
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Node Connection
Directory: db/mysql.js
*/
import mysql from "mysql2/promise"
export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Favoure246@",
  database: "ragdb",
  port: 3307
})
// insert documents
// await db.execute(
//   `
//   INSERT INTO documents(title, content) VALUES (?,?)
//   `,
//   [
//     "Node.js Intro",
//     "Node.js uses the V8 engine"
//   ]
// )
//
// await db.execute(
//   `
//   INSERT INTO documents(title, content) VALUES (?,?)
//   `,
//   [
//     "Bamidele",
//     "Bamidele is a 19 year old Nigerian. Working hard to earn a living in Software programming. In this age of AI, Bamidele's future has been greatly threatened."
//   ]
// )

// Stage 4: Chunking
/*
Why Chunking Matters: LLM cannot process huge documents efficiently so: Large documents -> small chunks
Chunker:
*/
export function chunkText(text, size=500) {
  const chunks = [];
  for (let i = 0; i<text.length; i++) {
    chunks.push(text.slice(i, i+size))
  }
  return chunks;
}

// Stage 5: ChromaDB connection
// Connect chroma
// Directory: chroma/client.js
import { ChromaClient } from "chromadb";
export const chroma = new ChromaClient({
  host: "localhost",
  port: 8000
})
// Create Collection
// const collection = await chroma.createCollection({
//   name: "documents"
// });
const collection = await chroma.getCollection({
  name: "documents",
  embeddingFunction: createEmbedding
})
// Store Embeddings
await collection.add({
  ids: ["1","2"],
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
//What chroma stores: id, document, Embedding vector, Metadata

/* Stage 6: Semantic Retrieval
In this step, the user asks a question and the question is converted to a vector that chroma uses to search from its chromadb (database).
Step 1: Embed query
*/
const prompt = "What is the title of the Bamidele's news"
const queryVector = await createEmbedding(prompt)
// Step 2: Search Chroma
const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 3
})
await console.log("Results from chromadb vector search: "+results.documents)

// Stage 7: Chat completions
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()
const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
})

// Build RAG Prompt
const context = results.documents[0].join("\n\n")

const completion = await client.chat.completions.create({
    model: "meta/llama-3.1-8b-instruct",
    messages: [
        {role: "system", content: "Use the provided context to answer the Question accurately."},
        {role: "user", content: `Content: ${context} Question: ${prompt}`}
    ]
})
console.log(completion.choices[0].message.content)

// Stage 8: Similarity Theory
// Cosine Similarity: Measures angle similarity between vectors.
// npm install compute-cosine-similarity
import similarity from "compute-cosine-similarity"
const score = similarity(context1.vector, context2.vector)
console.log(score)

// Stage 9: Hybrid Search
/*
Hybrid search is used because vectors miss exact keywords sometimes.
Continue with the Chatgpt session (on your Android or Chatgpt history)
*/