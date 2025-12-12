# Physical AI Textbook - System Architecture

## Overview
This document outlines the complete architecture for the Physical AI & Humanoid Robotics educational platform with RAG-powered chatbot, authentication, and intelligent task system.

## Technology Stack

### Frontend
- **Framework**: Docusaurus 3.9.2
- **UI Library**: React 19.0.0
- **Styling**: CSS Modules + Custom CSS
- **TypeScript**: 5.6.2

### Backend Services
- **AI/ML**: Vercel AI SDK / OpenAI SDK
- **Vector Database**: Simple in-memory vector store (can upgrade to Pinecone/Weaviate)
- **Authentication**: BetterAuth
- **API Routes**: Docusaurus plugins / Custom server

### AI & RAG System
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-4 / GPT-3.5-turbo
- **Vector Search**: Cosine similarity
- **Document Processing**: Markdown chunking with metadata

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │   Blog   │  │ Chapters │  │ Chatbot  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                │
│  │  Login   │  │  Signup  │                                │
│  └──────────┘  └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Layer                      │
│                      (BetterAuth)                           │
│  - Session Management                                       │
│  - JWT Tokens                                              │
│  - Protected Routes                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  /api/chat   │  │  /api/embed  │  │ /api/search  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│                      (Tasks System)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐                │
│  │         TaskRunner (Orchestrator)       │                │
│  └────────────────────────────────────────┘                │
│         │           │            │                          │
│         ▼           ▼            ▼                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Embed   │ │ Retrieve │ │ Generate │                   │
│  │   Task   │ │   Task   │ │   Task   │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Vector DB  │  │  User Store  │  │   Sessions   │     │
│  │  (In-Memory) │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  OpenAI API  │  │  Other APIs  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
my-ai-textbook/
├── src/
│   ├── components/
│   │   ├── HomepageFeatures/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── Chatbot/
│   │       ├── ChatInterface.tsx
│   │       ├── MessageBubble.tsx
│   │       └── TypingIndicator.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── betterauth.ts
│   │   │   └── middleware.ts
│   │   ├── rag/
│   │   │   ├── embeddings.ts
│   │   │   ├── vectorStore.ts
│   │   │   ├── retrieval.ts
│   │   │   └── chunking.ts
│   │   ├── ai/
│   │   │   ├── openai.ts
│   │   │   └── prompts.ts
│   │   └── utils/
│   │       ├── env.ts
│   │       └── logger.ts
│   ├── tasks/
│   │   ├── TaskRunner.ts
│   │   ├── embedTask.ts
│   │   ├── retrieveTask.ts
│   │   ├── generateTask.ts
│   │   └── index.ts
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── blog.tsx
│   │   ├── chatbot.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── css/
│       └── custom.css
├── docs/
│   └── [chapter markdown files]
├── config/
│   └── env.config.ts
└── api/
    ├── chat.ts
    ├── embed.ts
    └── search.ts
```

## RAG System Design

### Document Processing Pipeline
1. **Ingestion**: Read markdown chapter files
2. **Chunking**: Split into semantic chunks (~500 tokens)
3. **Embedding**: Generate vector embeddings (OpenAI)
4. **Storage**: Store in vector database with metadata
5. **Indexing**: Create searchable index

### Retrieval Process
1. **Query Embedding**: Convert user question to vector
2. **Similarity Search**: Find top-k similar chunks
3. **Context Assembly**: Combine retrieved chunks
4. **Response Generation**: LLM generates answer with context

### Vector Store Schema
```typescript
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    chapter: string;
    section: string;
    pageNumber?: number;
    source: string;
  };
  timestamp: Date;
}
```

## Authentication System

### BetterAuth Configuration
- **Providers**: Email/Password
- **Session Type**: JWT
- **Storage**: In-memory (can upgrade to database)
- **Middleware**: Route protection for /dashboard, /profile

### Protected Routes
- `/dashboard/*`
- `/profile`
- `/settings`

### Public Routes
- `/`
- `/docs/*`
- `/blog`
- `/chatbot`
- `/login`
- `/signup`

## Intelligent Tasks System

### Task Structure
```typescript
interface Task<TInput, TOutput> {
  name: string;
  description: string;
  execute: (input: TInput, context?: TaskContext) => Promise<TOutput>;
  validate?: (input: TInput) => boolean;
  retry?: RetryConfig;
}
```

### TaskRunner Features
- **Orchestration**: Chain multiple tasks
- **Error Handling**: Automatic retries
- **Logging**: Task execution tracking
- **Caching**: Result caching
- **Parallel Execution**: Run independent tasks concurrently

### Available Tasks
1. **embedTask**: Generate embeddings for text
2. **retrieveTask**: Retrieve relevant context
3. **generateTask**: Generate AI responses
4. **summarizeTask**: Summarize long content
5. **analyzeTask**: Analyze user queries

## API Endpoints

### /api/chat
- **Method**: POST
- **Input**: { message: string, sessionId: string }
- **Output**: { response: string, sources: Source[] }
- **Process**: Retrieve → Generate → Return

### /api/embed
- **Method**: POST
- **Input**: { text: string }
- **Output**: { embedding: number[] }
- **Process**: Call OpenAI embeddings API

### /api/search
- **Method**: GET
- **Input**: { query: string, limit: number }
- **Output**: { results: SearchResult[] }
- **Process**: Vector similarity search

## Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# BetterAuth
AUTH_SECRET=...
AUTH_URL=http://localhost:3000

# App
NODE_ENV=development
```

## Security Considerations

1. **API Keys**: Store in environment variables
2. **Authentication**: JWT validation on all protected routes
3. **Rate Limiting**: Prevent API abuse
4. **Input Validation**: Sanitize all user inputs
5. **CORS**: Configure allowed origins

## Performance Optimization

1. **Caching**: Cache embeddings and search results
2. **Lazy Loading**: Load components on demand
3. **Code Splitting**: Split large bundles
4. **Vector Store**: Optimize search with indexing
5. **Edge Runtime**: Deploy serverless functions

## Deployment Strategy

1. **Frontend**: Vercel / Netlify
2. **API**: Vercel Serverless Functions
3. **Vector DB**: Upgrade to Pinecone for production
4. **Auth**: BetterAuth with database backend

## Next Steps

1. Install dependencies
2. Create folder structure
3. Implement tasks system
4. Build RAG pipeline
5. Integrate authentication
6. Enhance UI
7. Test and deploy

---

**Last Updated**: 2025-12-11
**Version**: 1.0.0
