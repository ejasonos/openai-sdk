# AI Agent Infrastructure Learning Roadmap

## Principle
Do not jump directly into agents. Build competence in:

**SDK fundamentals → Retrieval → Workflows → Agent systems → Production infrastructure**

---

# Phase 1 — SDK Foundations (Week 1–2)

## OpenAI SDK Fundamentals

### Core Topics
- Chat Applications
  - Quick Chatbot
  - Streaming Chatbot
  - Memory / Persistent Chat
  - Multi-User Sessions

### Tool-Augmented AI
- Function Calling
- Structured Outputs

### Production Basics
- Authentication
- Sessions
- Deployment

## Projects
- CLI Chatbot
- Web Chatbot
- Memory Assistant
- Customer Support Bot

## Goal
Master messages, streaming, sessions, persistence, and application structure.

---

# Phase 2 — Retrieval & External Knowledge (Week 2–3)

## Tool Calling + RAG Infrastructure

### Core Topics
- Function Calling
- Structured Outputs
- Embeddings
- Vector Search
- RAG Systems
- Hybrid Search

### Vector Databases
- Pinecone
- Qdrant
- Weaviate
- pgvector

## Projects
- PDF Assistant
- Document Q&A
- Company Knowledge Base
- Meeting Notes Assistant

## Goal
Learn how models access, retrieve, and reason over external knowledge.

---

# Phase 3 — Manual Agent Workflows (Week 3–4)

## Agent Loop Concept
User → Model → Tool → Model → Tool → Response

## Build From Scratch
- Research Agent
- Travel Planner
- Code Assistant
- Data Analyst

## Topics
- Multi-Step Reasoning
- Tool Orchestration
- Workflow Design
- State Management

## Goal
Understand agent mechanics before abstractions hide them.

---

# Phase 4 — OpenAI Agents SDK (Week 4–5)

## Agent Infrastructure

### Core Topics
- Agents
- Runs & Sessions
- Context & Memory
- Tool Systems
  - Search
  - Database
  - Files
  - APIs
  - Terminal
  - Custom Tools

### Multi-Agent Workflows
- Sandboxes
- Async Execution
- Production Deployment

## Projects
- Coding Agent
- Research Agent
- Business Analyst Agent
- Autonomous Document Processor

## Goal
Learn orchestration, autonomous execution, and agent infrastructure.

---

# Phase 5 — Claude Ecosystem + MCP (Week 5–6)

## Claude Client SDK
- Chat Applications
- Tool Use
- Structured Outputs
- Context Management
- MCP Integration

## Claude Agent SDK
- Skills
- Memory
- Command Execution
- Managed Agents
- Multi-Agent Systems

## MCP Ecosystem
- MCP Fundamentals
- Servers & Clients
- OpenAI / Claude Integration
- Security
- Enterprise MCP

## Projects
- Claude Coding Assistant
- Repository Analysis Agent
- Documentation Generator

## Goal
Understand Anthropic’s agent architecture and MCP-first workflows.

---

# Phase 6 — Production AI Infrastructure

## Production Topics
- Prompt Management
- Evaluations
- Monitoring
- Tracing
- Observability
- Caching
- Rate Limiting
- Cost Control
- Security
- CI/CD
- Deployment

## Common Production Stack
- OpenAI SDK & Agents SDK
- Anthropic SDK & Agent SDK
- LangGraph
- LangSmith
- OpenTelemetry
- PostgreSQL + pgvector
- Pinecone / Qdrant / Weaviate

## Goal
Build reliable, observable, scalable AI systems.

---

# Final Learning Order

## Progression Path
1. OpenAI SDK Fundamentals
   - Chat
   - Streaming
   - Memory
   - Tool Calling
   - Production Basics

2. Retrieval Infrastructure
   - Embeddings
   - Vector Search
   - RAG
   - Hybrid Search

3. Manual Agent Workflows
   - Tool Loops
   - Multi-Step Reasoning
   - Workflow Design

4. OpenAI Agents SDK
   - Tools
   - Sessions
   - Memory
   - Multi-Agent Systems

5. Claude Ecosystem + MCP

6. Production AI Infrastructure

---

## 2026 Engineering Progression

SDK Fundamentals
→ Retrieval & Tool Use
→ Manual Agents
→ Agent SDKs
→ MCP Ecosystem
→ Production Infrastructure

This ordering reflects how mature AI engineering teams typically build systems in 2026.