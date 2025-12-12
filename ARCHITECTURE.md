# My AI Textbook - System Architecture

## Overview
A comprehensive Physical AI & Humanoid Robotics learning platform with RAG-powered chatbot, authentication, and intelligent task automation.

## Tech Stack
- **Frontend**: React + TypeScript + Docusaurus 3
- **Backend**: Node.js serverless functions (API routes)
- **AI/ML**: OpenAI GPT-4 + Embeddings (text-embedding-3-small)
- **Authentication**: BetterAuth
- **Vector Storage**: In-memory vector store (upgradeable to Pinecone/Weaviate)
- **Task Runner**: Custom intelligent task orchestration system

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │   Blog   │  │ Chatbot  │  │  Auth    │   │
│  │  Pages   │  │  Pages   │  │   UI     │  │  Pages   │   │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└────────┼────────────┼─────────────┼─────────────┼──────────┘
         │            │             │             │
         └────────────┴─────────────┴─────────────┘
                           │
         ┌─────────────────┴───────────────────┐
         │         API Routes Layer            │
         │  /api/chat    /api/auth    /api/*   │
         └─────────────────┬───────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───┴────┐         ┌───────┴───────┐      ┌──────┴─────┐
│  RAG   │         │  BetterAuth   │      │   Task     │
│ System │         │    System     │      │   Runner   │
└───┬────┘         └───────┬───────┘      └──────┬─────┘
    │                      │                      │
    ├─ Embeddings         ├─ Session Mgmt        ├─ AI Tasks
    ├─ Vector Store       ├─ JWT Tokens          ├─ Workflow
    ├─ Retrieval          ├─ Middleware          ├─ Cache
    └─ OpenAI LLM         └─ User DB             └─ Retry Logic
```

---

## Core Components

### 1. RAG Chatbot System

#### 1.1 Document Ingestion Pipeline
```typescript
docs/*.md → Chunker → Embeddings → Vector Store
```

**Flow:**
1. Read all markdown documentation
2. Split into semantic chunks (500-1000 tokens)
3. Generate embeddings using OpenAI text-embedding-3-small
4. Store in vector database with metadata

**Files:**
- `src/lib/rag/document-processor.ts` - Document chunking
- `src/lib/rag/embeddings.ts` - Embedding generation
- `src/lib/rag/vector-store.ts` - Vector storage and retrieval
- `src/tasks/ingestion-task.ts` - Document ingestion task

#### 1.2 Retrieval System
```typescript
User Query → Embed Query → Semantic Search → Top K Results → Context
```

**Flow:**
1. Embed user query
2. Perform cosine similarity search
3. Retrieve top 3-5 relevant chunks
4. Format as context for LLM

**Files:**
- `src/lib/rag/retriever.ts` - Semantic search logic
- `src/lib/rag/reranker.ts` (optional) - Re-rank results

#### 1.3 Response Generation
```typescript
Query + Context → OpenAI GPT-4 → Stream Response
```

**Flow:**
1. Construct prompt with system instructions + context + query
2. Call OpenAI Chat Completion API
3. Stream response to frontend
4. Include source citations

**Files:**
- `src/lib/rag/generator.ts` - LLM response generation
- `src/pages/api/chat.ts` - Chat API endpoint

---

### 2. Authentication System (BetterAuth)

#### 2.1 Auth Configuration
```typescript
BetterAuth({
  providers: [email(), credentials()],
  session: { expiresIn: "7d" },
  callbacks: { onSignIn, onSignOut }
})
```

**Features:**
- Email/password authentication
- Session management with JWT
- Protected routes
- Middleware for route guards

**Files:**
- `src/lib/auth/better-auth.ts` - Auth configuration
- `src/lib/auth/middleware.ts` - Route protection
- `src/pages/api/auth/[...all].ts` - Auth API routes

#### 2.2 Auth Pages
- `/login` - Sign in form
- `/signup` - Registration form
- `/dashboard` - Protected user dashboard
- `/profile` - User profile management

**Files:**
- `src/pages/login.tsx` - Login page
- `src/pages/signup.tsx` - Signup page
- `src/pages/dashboard.tsx` - Protected dashboard
- `src/components/auth/` - Auth UI components

#### 2.3 Session Management
- Client-side: Store JWT in httpOnly cookie
- Server-side: Validate token in middleware
- Edge runtime compatible

---

### 3. Intelligent Tasks System

#### 3.1 Task Architecture
```typescript
interface Task<TInput, TOutput> {
  name: string;
  description: string;
  execute: (input: TInput, context?: TaskContext) => Promise<TOutput>;
  validate?: (input: TInput) => boolean | Promise<boolean>;
  retry?: RetryConfig;
  timeout?: number;
}
```

#### 3.2 Available Tasks
- **embedTask**: Generate text embeddings
- **chatTask**: AI chat completion
- **ingestionTask**: Process and store documents
- **searchTask**: Semantic search
- **summaryTask**: Summarize text
- **extractTask**: Extract structured data

**Files:**
- `src/tasks/TaskRunner.ts` - Core orchestration
- `src/tasks/types.ts` - Task interfaces
- `src/tasks/embed-task.ts` - Embedding generation
- `src/tasks/chat-task.ts` - Chat completions
- `src/tasks/ingestion-task.ts` - Document ingestion
- `src/tasks/search-task.ts` - Semantic search

#### 3.3 Task Runner Features
- ✅ Retry logic with exponential backoff
- ✅ Task caching
- ✅ Timeout handling
- ✅ Sequential & parallel execution
- ✅ Execution history tracking
- ✅ Error handling and recovery

---

### 4. Vector Storage

#### 4.1 In-Memory Vector Store
```typescript
class VectorStore {
  private vectors: Map<string, Vector>;

  async add(id: string, embedding: number[], metadata: any): Promise<void>
  async search(query: number[], topK: number): Promise<SearchResult[]>
  async delete(id: string): Promise<void>
  async clear(): Promise<void>
}
```

**Features:**
- Cosine similarity search
- Metadata filtering
- Batch operations
- Persistence to JSON file

**Files:**
- `src/lib/rag/vector-store.ts` - Vector storage implementation
- `src/lib/rag/similarity.ts` - Similarity calculations

#### 4.2 Upgrade Path
- **Phase 1**: In-memory (MVP, fast development)
- **Phase 2**: File-based persistence (JSON)
- **Phase 3**: External vector DB (Pinecone, Weaviate, Qdrant)

---

## API Endpoints

### Chat Endpoints
- `POST /api/chat` - RAG chatbot conversation
- `GET /api/chat/history` - Conversation history
- `DELETE /api/chat/history/:id` - Clear conversation

### Auth Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Admin Endpoints
- `POST /api/admin/ingest` - Trigger document ingestion
- `GET /api/admin/stats` - System statistics
- `POST /api/admin/reindex` - Rebuild vector index

---

## Data Flow: RAG Chatbot

### 1. Document Ingestion (One-time)
```
markdown files → parse → chunk → embed → store
```

### 2. User Query (Real-time)
```
User Input
  ↓
Embed Query
  ↓
Semantic Search (Vector Store)
  ↓
Retrieve Top 3-5 Chunks
  ↓
Format Context
  ↓
LLM (GPT-4) with Context + Query
  ↓
Stream Response to User
  ↓
Display with Source Citations
```

---

## Security Considerations

### Authentication
- JWT tokens in httpOnly cookies
- CSRF protection
- Password hashing (bcrypt)
- Rate limiting on auth endpoints

### API Security
- Input validation with Zod
- SQL injection prevention (if using DB)
- XSS protection
- API key rotation

### Content Security
- Sanitize user inputs
- Prevent prompt injection
- Content filtering
- Rate limiting on AI endpoints

---

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- React.memo for components
- Debounced search inputs

### Backend
- Task result caching
- Connection pooling
- Response streaming
- CDN for static assets

### AI/ML
- Embedding caching
- Batch processing
- Retry logic
- Timeout management

---

## Deployment Architecture

### Development
```
Local: localhost:3000
API: Inline (src/pages/api/*)
Vector Store: In-memory
Auth: Development mode
```

### Production
```
Frontend: Vercel/Netlify
API: Serverless Functions
Vector Store: Pinecone/Weaviate
Auth: Production mode with secure cookies
CDN: Cloudflare/Vercel Edge
```

---

## Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Auth
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000

# Database (future)
DATABASE_URL=postgresql://...

# Node
NODE_ENV=development|production
```

---

## Testing Strategy

### Unit Tests
- Task Runner logic
- Vector similarity calculations
- Auth middleware
- Document processing

### Integration Tests
- RAG pipeline end-to-end
- Auth flow
- API endpoints

### E2E Tests
- User registration → login → chat
- Document ingestion → retrieval
- Session persistence

---

## Monitoring & Observability

### Metrics to Track
- API response times
- Token usage (OpenAI)
- Vector search latency
- User engagement
- Error rates

### Logging
- Request/response logs
- Error tracking (Sentry)
- Performance monitoring
- Usage analytics

---

## Future Enhancements

### Phase 2
- [ ] Conversation memory
- [ ] Multi-turn dialogue
- [ ] Source citations UI
- [ ] Feedback mechanism

### Phase 3
- [ ] Multi-modal RAG (images, code)
- [ ] Advanced re-ranking
- [ ] Hybrid search (keyword + semantic)
- [ ] User personalization

### Phase 4
- [ ] Team collaboration
- [ ] Admin dashboard
- [ ] Analytics
- [ ] A/B testing

---

## Development Workflow

### 1. Setup
```bash
npm install
cp .env.example .env
# Configure OpenAI API key
```

### 2. Development
```bash
npm run dev        # Start dev server
npm run test       # Run tests
npm run typecheck  # Type checking
```

### 3. Document Ingestion
```bash
npm run ingest     # Process all docs
```

### 4. Deployment
```bash
npm run build      # Production build
npm run deploy     # Deploy to production
```

---

## Folder Structure

```
my-ai-textbook/
├── docs/                     # Markdown documentation
├── src/
│   ├── components/
│   │   ├── auth/            # Auth UI components
│   │   ├── chat/            # Chat UI components
│   │   └── common/          # Shared components
│   ├── lib/
│   │   ├── ai/              # OpenAI utilities
│   │   ├── auth/            # BetterAuth config
│   │   ├── rag/             # RAG system
│   │   │   ├── document-processor.ts
│   │   │   ├── embeddings.ts
│   │   │   ├── vector-store.ts
│   │   │   ├── retriever.ts
│   │   │   └── generator.ts
│   │   └── utils/           # Utility functions
│   ├── pages/
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Auth endpoints
│   │   │   ├── chat.ts      # Chat endpoint
│   │   │   └── admin/       # Admin endpoints
│   │   ├── blog.tsx         # Blog page
│   │   ├── chatbot.tsx      # Chatbot page
│   │   ├── login.tsx        # Login page
│   │   ├── signup.tsx       # Signup page
│   │   └── dashboard.tsx    # Dashboard
│   ├── tasks/               # Task system
│   │   ├── TaskRunner.ts
│   │   ├── types.ts
│   │   ├── embed-task.ts
│   │   ├── chat-task.ts
│   │   ├── ingestion-task.ts
│   │   └── search-task.ts
│   └── types/               # TypeScript types
├── vitest.config.ts         # Test configuration
├── docusaurus.config.ts     # Docusaurus config
└── package.json
```

---

## Key Design Decisions

### 1. Why In-Memory Vector Store?
- **Pro**: Fast development, no external dependencies, simple
- **Con**: Not scalable, data loss on restart
- **Mitigation**: Persist to JSON file, easy migration path

### 2. Why BetterAuth?
- Modern, type-safe, edge-compatible
- Built-in session management
- Flexible provider system
- Good TypeScript support

### 3. Why Task Runner Pattern?
- Reusable across features
- Centralized retry/error handling
- Easy to test and monitor
- Composable workflows

### 4. Why RAG over Fine-Tuning?
- More cost-effective
- Easier to update content
- Transparent and explainable
- Better for factual QA

---

## Conclusion

This architecture provides a solid foundation for a production-ready AI textbook platform with advanced features like RAG chatbot, authentication, and intelligent task automation. The modular design allows for incremental development and easy scaling.
