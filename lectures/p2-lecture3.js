// Embeddings
/* --------- Brief on Embeddings ----------
OpenAI embeddign models: text-embedding-3-small
RAG Stack: LLM, Embeddings, Vector DB, Database, Runtime
*/
// Step 1: Install PostgreSQL + pgvector
// Step 2: Install Dependencies
// npm install openai pg pgvector dotenv
// Step 3: Setup openai
// -------- openai.js -------------
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()
const API_KEY = process.env.OPENAI_API_KEY
    ?.replace(/[\u200E\u200F\u202A-\u202E]/g, "")
    .trim();
export const client = new OpenAI({
    apiKey: API_KEY
})
// Step 4: Generate Embeddings
// --------- embed.js -------------
const text = "Nodejs is a Javascript runtime built on Chrome's V8 engine.";
const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text
})
const embedding = response.data[0].embedding;
console.log(embedding.length)
// Step 5: Create Vector Table
/*
CREATE EXTENSION vector;
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536)
);
*/
// Step 6: Insert Embeddings
import pg from "pg";
import pgvector from "pgvector";
const db = new pg.client({
    connectionString: process.env.DATABASE_URL
});
await db.connect();
await pgvector.registerTypes(db)
await db.query(
    `
    INSERT INTO documents (content, embedding) VALUES ($1, $2)
    `,
    [
        text,
        pgvector.toSql(embedding)
    ]
)
// Step 7: Query Similar Documents
// User asks: "How does Node.js work?"; You embed the query too
const queryEmbeddingResponse = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: "prompt"
})
const queryEmbedding = queryEmbeddingResponse.data[0].embedding
// Step 8: Semantic Search
const result = await db.query(
    `
    SELECT content, embedding <=> $1 AS distance
    FROM documents
    ORDER BY distance
    LIMIT 3
    `,
    [pgvector.toSql(queryEmbedding)]
);
console.log(result.rows)
// Step 9: Build Actual RAG
const context = result.rows.map(row => row.content).join("\n\n");
const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
        {role: "system", content: "Use the provided context to answer accurately. If not return 'Sorry, I cannot answer that question.'"},
        {role: "user", content: `Content: ${context} Question: prompt`}
    ]
})
console.log(completion.choices[0].message.content)

/* What I learned
1. I need an openai key for the embedding
2. I hope to return and finish this last part before Multi Agent.
3. Try to implement MySQL or just install PostgreSQL
*/

// Retrieval & External Knowledge: Embeddings, Vector Search, RAG
/*
Stack: Nodejs, MySQL, ChromaDB, OpenAI SDK, NVIDIA Chat Completions, Local Embeddings
RAG System architecture: Documents -> Chunking -> Embeddings -> Vector Search -> Similarity Search -> Inject Relevant Context -> LLM Response

What is an Embedding: an embedding is a text -> numbers. These numbers mathematically represent semantic meaning.
Vector Search: Vectors allow similarity comparison. The find semantically related meaning.
ChromaDB: stores vectors efficiently and retrieves nearest matches.

Note: Embeddings are not sent to the LLM, only retreived text.
*/
// Stage 1: Embeddings
/* npm install openai mysql2 chromadb @xenova/transformers dotenv
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
import { pipeline } from "@xenova/transformers"
const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);
export async funtion createEmbedding(text) {
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  })
  return Array.from(output.data)
}
// What this does: Text -> Transformer Model -> Vector

// Test it
import { createEmbedding } from './embedder.js';
const vector = await createEmbedding("Node.js is a Javascript runtime")
console.log(vector.length)
*/
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
// db/mysql.js
import mysql from "mysql2/promise"
export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ragdb"
})
// insert documents
await db.execute(
  `
  INSERT INTO documents(title, content) VALUES (?,?)
  `,
  [
    "Node.js Intro",
    "Node.js uses the V8 engine"
  ]
)
*/
// Stage 4: Chunking
/*
Why Chunking Matters: LLM cannot process huge documents efficiently so: Large documents -> small chunks
Chunker:
export function chunkText(text, size=500) {
  const chunks = [];
  for (let i = 0; i<text.length; i++) {
    chunks.push(text.slice(i, i+size))
  }
  return chunks;
}
*/
// Stage 5: ChromaDB connection
/* Connect chroma
chroma/client.js
import { ChromaClient } from "chromadb";
export const chroma = new ChromaClient({
  path: "http://localhost:8000"
})

Create Collection
const collection = await chroma.createCollection({
  name: "documents"
});

Store Embeddings
await collection.add({
  ids: ["1"],
  documents: [
    "Node.js uses V8 engine"
  ],
  embeddings: [vector]
})

What chroma stores: id, document, Embedding vector, Metadata
*/
// Stage 6: Semantic Retrieval
/*
User query: "How does Node work?"
Step 1: Embed query
const queryVector = await createEmbedding(
    "How does Node works?"
)
Step 2: Search Chroma
const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 3
})
*/
// Stage 7: Chat completions
/*
import OpenAI from 'openai'
const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL
})

Build RAG Prompt
const context = results.documents[0].join("\n\n")

const completion = await client.chat.completions.create({
    model: "meta/llama-3.1-70b-instruct",
    messages: [
        {role: "system", content: "Use the provided context to answer the Question accurately or else return 'Sorry, I cannot fulfill your request.'"},
        {role: "user", content: `Content: ${context} Question: ${prompt}`}
    ]
})
console.log(completion.choices[0].message.content)
*/
// Stage 8: Similarity Theory
/*
Cosine Similarity: Measures angle similarity between vectors.
npm install compute-cosine-similarity
import similarity from "compute-cosine-similarity"
const score = similarity(vec1, vec2)
console.log(score)
*/
// Stage 9: Hybrid Search
/*
Hybrid search is used because vectors miss exact keywords sometimes.
Continue with the Chatgpt session (on your Android or Chatgpt history)
*/