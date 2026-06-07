# OpenAI SDK — Lecture 3

## Sessions, Persistence & Multi-User Memory

Good. We have already built:

1. **Simple chatbot** → request → response
2. **Short-term memory** → `messages.push(...)`
3. **Streaming UX** → token-by-token output

Now we cross an important boundary.

We stop building **toys**.

We start building **applications**.

---

# Part 1 — The Big Problem

Our previous chatbot looked like this:

```js
const messages = []

messages.push({
    role: "user",
    content: "Hello"
})
```

Works perfectly.

Until reality arrives.

Suppose:

* User A talks
* User B joins
* server restarts
* 500 users connect simultaneously

Question:

**Where is memory stored?**

Answer:

```txt
RAM
```

And RAM is temporary.

When the process dies:

```txt
messages = gone
conversation = gone
memory = gone
```

Your chatbot develops amnesia.

That is unacceptable in production.

---

# Part 2 — Understanding Sessions

A **session** is simply:

> an isolated conversational context belonging to one user.

Think classroom attendance.

Each student owns their notebook.

You cannot mix notebooks.

---

## Bad Design

Imagine this:

```js
const messages = []
```

All users share one array.

User A:

```txt
Hi, my name is Sarah
```

User B:

```txt
What is my name?
```

AI:

```txt
Your name is Sarah.
```

Disaster.

Cross-user memory leak.

---

## Correct Design

Each user owns separate memory.

Conceptually:

```txt
User A → Session A → Messages A

User B → Session B → Messages B

User C → Session C → Messages C
```

Strict boundaries.

Always.

---

# Part 3 — Data Modeling

Professional AI systems usually model around four concepts.

---

## 1. Users

Who owns the account?

Example:

```js
{
    id: "user_123",
    name: "Favour",
    email: "favour@example.com"
}
```

---

## 2. Conversations

One user can own multiple chats.

Like ChatGPT.

You may have:

```txt
Chat 1 → JavaScript Help
Chat 2 → Startup Planning
Chat 3 → Assignment Draft
```

Structure:

```js
{
    id: "conv_001",
    userId: "user_123",
    title: "OpenAI SDK Learning"
}
```

Notice:

```txt
conversation belongs to user
```

Relationship matters.

---

## 3. Messages

Messages are the actual dialogue.

Example:

```js
{
    id: "msg_1",
    conversationId: "conv_001",
    role: "user",
    content: "Explain streaming."
}
```

Assistant response:

```js
{
    id: "msg_2",
    conversationId: "conv_001",
    role: "assistant",
    content: "Streaming sends partial tokens..."
}
```

---

## 4. Memory Records (Optional)

Sometimes you want persistent personalization.

Not every message.

Only important facts.

Example:

```txt
User prefers concise explanations.
User is learning Node.js.
User studies EV systems.
```

Structure:

```js
{
    userId: "user_123",
    key: "learning_style",
    value: "concise"
}
```

---

Visualize the architecture.

```txt
USER
 └── CONVERSATIONS
      └── MESSAGES

OPTIONAL:
USER
 └── MEMORY RECORDS
```

That structure scales.

---

# Part 4 — Moving Beyond `messages.push()`

Earlier:

```js
messages.push(...)
```

Memory existed only in runtime.

Now we persist.

Example:

---

### Save message

```js
async function saveMessage(message) {
    await db.messages.insert(message)
}
```

---

### Load history

```js
async function loadConversation(id) {
    return db.messages.find({
        conversationId: id
    })
}
```

---

Flow becomes:

```txt
User sends message
        ↓
Load history from database
        ↓
Append new message
        ↓
Send to model
        ↓
Save assistant reply
        ↓
Return response
```

This is the backbone of modern chat systems.

---

# Part 5 — Example Multi-User Architecture

Let us simulate.

---

## Database

```js
const db = {
    conversations: {},
    messages: {}
}
```

---

## Conversation loader

```js
function getMessages(conversationId) {
    return db.messages[conversationId] || []
}
```

---

## Conversation saver

```js
function saveMessage(conversationId, message) {

    if (!db.messages[conversationId]) {
        db.messages[conversationId] = []
    }

    db.messages[conversationId].push(message)
}
```

---

## Chat handler

Observe carefully.

```js
async function chat(
    userId,
    conversationId,
    prompt
) {

    const history =
        getMessages(conversationId)

    history.push({
        role: "user",
        content: prompt
    })

    const response =
        await client.chat.completions.create({

        model:
            "gpt-4.1-mini",

        messages: history
    })

    const reply =
        response.choices[0]
        .message.content

    saveMessage(
        conversationId,
        {
            role: "assistant",
            content: reply
        }
    )

    return reply
}
```

Notice the evolution.

Old world:

```txt
one global array
```

New world:

```txt
per-conversation history
per-user isolation
durable persistence
```

---

# Part 6 — Why We Separate Users and Conversations

Important architectural question.

Why not:

```txt
user → messages
```

Why insert conversations?

Because humans multitask.

One user may simultaneously discuss:

```txt
AI agents
Frontend bugs
Exam prep
Business strategy
```

Each thread needs independent context.

Otherwise:

```txt
"Fix my React bug."

AI remembers:

"Your EV motor controller..."
```

Wrong context contamination.

Conversation boundaries solve this.

---

# Part 7 — Session Boundaries (Production Rule)

Production principle:

> Never trust client memory.

The frontend should send:

```txt
conversationId
```

Backend verifies:

```txt
Does this conversation belong to this user?
```

Always.

Example:

```js
if (
    conversation.userId !==
    authenticatedUser.id
) {
    throw Error("Unauthorized")
}
```

Without this:

User A can read User B's conversations.

Critical security failure.

---

# Part 8 — Persistence Technologies

What stores memory?

Depends on scale.

---

### Small projects

```txt
JSON files
SQLite
```

---

### Medium systems

```txt
PostgreSQL
MySQL
MongoDB
```

---

### Large AI systems

Often combine:

```txt
Postgres → structured records

Redis → fast session cache

Vector DB → semantic memory
```

Each solves a different problem.

---

# Part 9 — Memory Layers

Advanced mental model.

Not all memory is identical.

### Layer 1 — Context Window Memory

Temporary.

```txt
messages[]
```

Dies after request/session.

---

### Layer 2 — Persistent Conversation Memory

Stored history.

```txt
database conversations
```

Survives restart.

---

### Layer 3 — Long-Term User Memory

Stable preferences.

Example:

```txt
Prefers examples.
Learning backend engineering.
Likes concise answers.
```

Cross-conversation.

---

# Part 10 — Classroom Analogy

Imagine a university.

---

### Student

```txt
User
```

### Courses

```txt
Conversations
```

### Lecture notes

```txt
Messages
```

### Student profile

```txt
Memory records
```

Destroy lecture notes:

Conversation forgotten.

Destroy profile:

Personalization disappears.

Mix student notebooks:

Chaos.

That is exactly how chat architecture behaves.

---

# Lecture Summary

You learned the transition from:

```txt
messages.push()
```

to:

```txt
Production Memory Architecture
```

Core concepts:

✓ Sessions
✓ User isolation
✓ Conversations
✓ Messages
✓ Persistence
✓ Long-term memory
✓ Security boundaries

---

# Mini Assignment

Design a schema for:

**Multi-User AI Study Assistant**

Requirements:

* 1 user
* multiple conversations
* stored messages
* saved learning preferences

Define:

```txt
Users table
Conversations table
Messages table
Memory table
```

Then implement:

```js
saveMessage()
loadConversation()
createConversation()
```

---

Next lecture naturally becomes:

## Retrieval, Context Windows & Memory Compression

Because once conversations become large, a new problem appears:

```txt
Too much history.
Too many tokens.
Too much cost.
```

And that changes everything.
