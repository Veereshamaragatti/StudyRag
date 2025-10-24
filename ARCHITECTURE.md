# 🏗️ StudyRAG System Architecture

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                             │
│  ┌──────────────┬─────────────────┬──────────────────────────┐    │
│  │ Login Page   │  Dashboard Page  │    Chat Page             │    │
│  │              │                  │                          │    │
│  │ • Google     │  • File Upload   │  • Text Input            │    │
│  │   Login      │  • Doc List      │  • Voice Input           │    │
│  │   Button     │  • Delete Docs   │  • Image Upload          │    │
│  │              │  • View Metadata │  • Message History       │    │
│  └──────────────┴─────────────────┴──────────────────────────┘    │
│                                  │                                  │
│  Components: ChatWindow, FileUploader, MicInput, MessageBubble     │
│  API Client: axios with credentials                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                      HTTP/HTTPS (withCredentials)
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express + Node.js)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    AUTHENTICATION LAYER                       │  │
│  │  • Google OAuth 2.0 (Passport.js)                            │  │
│  │  • Session Management (express-session)                      │  │
│  │  • Auth Middleware (isAuthenticated)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API ROUTES                               │  │
│  │  ┌─────────────┬──────────────────┬──────────────────────┐  │  │
│  │  │ Auth Routes │ Document Routes   │   Chat Routes        │  │  │
│  │  │             │                   │                      │  │  │
│  │  │ /auth/*     │ /api/docs/*       │  /api/chat/*         │  │  │
│  │  └─────────────┴──────────────────┴──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      CONTROLLERS                              │  │
│  │  • authController: Login/Logout/GetUser                      │  │
│  │  • documentController: Upload/List/Delete                    │  │
│  │  • chatController: Ask/History/GetChat                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  │                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        SERVICES                               │  │
│  │  ┌───────────────┬──────────────────┬────────────────────┐  │  │
│  │  │ File Service  │ Embedding Service │ Retrieval Service  │  │  │
│  │  │               │                   │                    │  │  │
│  │  │ • Parse PDF   │ • Generate        │ • Vector Search    │  │  │
│  │  │ • Parse DOCX  │   Embeddings      │ • Cosine           │  │  │
│  │  │ • Parse TXT   │ • Batch Process   │   Similarity       │  │  │
│  │  │ • Chunk Text  │ • text-embedding  │ • Top-K Retrieval  │  │  │
│  │  └───────────────┴──────────────────┴────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │            Gemini Service                              │ │  │
│  │  │  • Text Q&A (Gemini 1.5 Pro)                           │ │  │
│  │  │  • Image Analysis (Gemini Vision)                      │ │  │
│  │  │  • Context Injection                                   │ │  │
│  │  │  • Follow-up Generation                                │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                      ┌───────────┴────────────┐
                      ↓                        ↓
    ┌─────────────────────────┐   ┌──────────────────────────┐
    │   MONGODB ATLAS         │   │   GOOGLE GEMINI API      │
    │                         │   │                          │
    │  Collections:           │   │  Models:                 │
    │  • users                │   │  • gemini-1.5-pro        │
    │  • documents            │   │  • text-embedding-004    │
    │    - chunks[]           │   │                          │
    │    - embeddings[]       │   │  Features:               │
    │  • chats                │   │  • Text generation       │
    │    - messages[]         │   │  • Image analysis        │
    │                         │   │  • Context understanding │
    │  Indexes:               │   │  • Multimodal support    │
    │  • userId               │   │                          │
    │  • Vector Search        │   └──────────────────────────┘
    │  • Text Search          │
    └─────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Click "Continue with Google"
     ↓
┌─────────────────┐
│  Frontend       │
│  /login page    │
└────┬────────────┘
     │
     │ 2. Redirect to /auth/google
     ↓
┌─────────────────────┐
│  Backend            │
│  Express + Passport │
└────┬────────────────┘
     │
     │ 3. Redirect to Google OAuth
     ↓
┌─────────────────┐
│  Google OAuth   │
│  Consent Screen │
└────┬────────────┘
     │
     │ 4. User approves
     ↓
┌─────────────────────┐
│  Backend            │
│  /auth/google/      │
│  callback           │
└────┬────────────────┘
     │
     │ 5. Create/Find User in MongoDB
     │ 6. Create Session
     ↓
┌─────────────────┐
│  Frontend       │
│  /dashboard     │
└─────────────────┘
     │
     │ 7. User authenticated! ✅
     ↓
```

## 📄 Document Upload & Processing Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Select File (PDF/DOCX/TXT)
     │ 2. Add name & tags
     │ 3. Click Upload
     ↓
┌────────────────────┐
│  FileUploader      │
│  Component         │
└────┬───────────────┘
     │
     │ 4. FormData with file
     ↓
┌────────────────────┐
│  Backend           │
│  /api/docs/upload  │
└────┬───────────────┘
     │
     │ 5. Multer saves to /uploads
     ↓
┌────────────────────┐
│  fileService       │
│  parseFile()       │
└────┬───────────────┘
     │
     │ 6. Extract text
     │ 7. Chunk text (1000 chars, 200 overlap)
     ↓
┌────────────────────┐
│  embeddingService  │
│  generateEmbeddings│
└────┬───────────────┘
     │
     │ 8. Call Gemini text-embedding-004
     ↓
┌────────────────────┐
│  Google Gemini API │
└────┬───────────────┘
     │
     │ 9. Return vector embeddings (768-dim)
     ↓
┌────────────────────┐
│  MongoDB           │
│  documents         │
│  collection        │
└────┬───────────────┘
     │
     │ 10. Store:
     │     - Document metadata
     │     - Chunks with embeddings
     │     - User reference
     ↓
┌────────────────────┐
│  Frontend          │
│  Success message   │
│  Refresh doc list  │
└────────────────────┘
```

## 💬 Chat/Question Answering Flow (RAG)

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ 1. Type question or use voice/image
     ↓
┌────────────────────┐
│  ChatWindow        │
│  Component         │
└────┬───────────────┘
     │
     │ 2. POST /api/chat/ask
     │    { question, chatId?, image? }
     ↓
┌────────────────────┐
│  chatController    │
│  askQuestion()     │
└────┬───────────────┘
     │
     │ 3. Generate query embedding
     ↓
┌────────────────────┐
│  embeddingService  │
└────┬───────────────┘
     │
     │ 4. Vector embedding for query
     ↓
┌────────────────────┐
│  retrievalService  │
│  retrieveRelevant  │
│  Chunks()          │
└────┬───────────────┘
     │
     │ 5. Get all user documents from MongoDB
     │ 6. Calculate cosine similarity
     │ 7. Sort by score
     │ 8. Return top-5 chunks
     ↓
┌────────────────────┐
│  geminiService     │
│  askGemini()       │
└────┬───────────────┘
     │
     │ 9. Build prompt with:
     │    - Conversation history
     │    - Retrieved context chunks
     │    - User question
     ↓
┌────────────────────┐
│  Google Gemini API │
│  gemini-1.5-pro    │
└────┬───────────────┘
     │
     │ 10. AI generates:
     │     - Detailed answer
     │     - Follow-up questions (3)
     ↓
┌────────────────────┐
│  MongoDB           │
│  chats collection  │
└────┬───────────────┘
     │
     │ 11. Save conversation:
     │     - User message
     │     - Assistant message
     │     - Timestamp
     ↓
┌────────────────────┐
│  Frontend          │
│  Display:          │
│  • Answer          │
│  • Follow-ups      │
│  • Sources         │
└────────────────────┘
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────┐
│  MONGODB ATLAS - Database: studyrag                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Collection: users                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  {                                              │    │
│  │    _id: ObjectId,                               │    │
│  │    googleId: String,        // Google user ID   │    │
│  │    name: String,            // Full name        │    │
│  │    email: String,           // Email address    │    │
│  │    avatar: String,          // Profile pic URL  │    │
│  │    createdAt: Date          // Registration     │    │
│  │  }                                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Collection: documents                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  {                                              │    │
│  │    _id: ObjectId,                               │    │
│  │    userId: ObjectId,        // Owner reference  │    │
│  │    name: String,            // Display name     │    │
│  │    originalName: String,    // File name        │    │
│  │    filePath: String,        // Storage path     │    │
│  │    fileType: String,        // MIME type        │    │
│  │    tags: [String],          // User tags        │    │
│  │    size: Number,            // File size bytes  │    │
│  │    uploadedAt: Date,        // Upload timestamp │    │
│  │    chunks: [                                    │    │
│  │      {                                          │    │
│  │        text: String,        // Chunk content    │    │
│  │        embedding: [Number], // 768-dim vector   │    │
│  │        page: Number         // Optional         │    │
│  │      }                                          │    │
│  │    ]                                            │    │
│  │  }                                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Collection: chats                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  {                                              │    │
│  │    _id: ObjectId,                               │    │
│  │    userId: ObjectId,        // Owner reference  │    │
│  │    messages: [                                  │    │
│  │      {                                          │    │
│  │        role: String,        // 'user'|'assistant'│   │
│  │        content: String,     // Message text     │    │
│  │        timestamp: Date,     // When sent        │    │
│  │        imageUrl: String,    // Optional         │    │
│  │        audioUrl: String     // Optional         │    │
│  │      }                                          │    │
│  │    ],                                           │    │
│  │    createdAt: Date,         // Chat started     │    │
│  │    updatedAt: Date          // Last message     │    │
│  │  }                                              │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Indexes:                                                │
│  • users.googleId (unique)                              │
│  • documents.userId                                     │
│  • documents (text index on name, tags)                 │
│  • chats.userId                                         │
│  • chats.updatedAt                                      │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Vector Search Algorithm

```
Query: "What is machine learning?"

Step 1: Generate Query Embedding
┌─────────────────────────────────┐
│  text-embedding-004             │
│  Input: "What is machine..."    │
│  Output: [0.123, -0.456, ...]   │  (768 dimensions)
└─────────────────────────────────┘

Step 2: Retrieve User Documents
┌─────────────────────────────────┐
│  MongoDB Query:                 │
│  db.documents.find({            │
│    userId: user._id             │
│  })                             │
└─────────────────────────────────┘

Step 3: Calculate Similarity
For each chunk in each document:
  similarity = cosine_similarity(
    query_embedding,
    chunk_embedding
  )

Cosine Similarity Formula:
  cos(θ) = (A · B) / (||A|| × ||B||)

Step 4: Rank & Select Top-K
┌─────────────────────────────────┐
│  Chunk 1: 0.89 similarity ✅    │
│  Chunk 2: 0.87 similarity ✅    │
│  Chunk 3: 0.82 similarity ✅    │
│  Chunk 4: 0.79 similarity ✅    │
│  Chunk 5: 0.76 similarity ✅    │
│  Chunk 6: 0.45 similarity ❌    │
│  ...                            │
└─────────────────────────────────┘

Step 5: Inject into Prompt
Context: [Top 5 chunks combined]
Question: "What is machine learning?"
→ Send to Gemini 1.5 Pro
→ Generate answer
```

## 🔄 State Management

```
Frontend State Flow:

┌─────────────┐
│  App Load   │
└──────┬──────┘
       │
       ├──→ Check Authentication
       │    ├─ Success: Fetch user data
       │    └─ Failure: Redirect to /login
       │
       ├──→ Load Documents List
       │    └─ Display in dashboard
       │
       ├──→ Load Chat History
       │    └─ Display in chat page
       │
       └──→ Setup Real-time State
            ├─ Messages state
            ├─ Loading state
            ├─ Error state
            └─ Follow-up questions state
```

## 🎨 UI Component Hierarchy

```
App (layout.tsx)
│
├── Login Page (/login)
│   └── GoogleLoginButton
│
├── Dashboard Page (/dashboard)
│   ├── Header (with logout)
│   ├── FileUploader
│   │   ├── File input
│   │   ├── Name input
│   │   └── Tags input
│   └── Documents List
│       └── Document Card (foreach)
│           ├── Metadata
│           ├── Tags
│           └── Delete button
│
└── Chat Page (/)
    ├── Header (with navigation)
    └── ChatWindow
        ├── Messages Area
        │   ├── MessageBubble (foreach)
        │   └── Follow-up Questions
        └── Input Area
            ├── Image Button
            ├── MicInput
            ├── Text Input
            └── Send Button
```

---

This architecture supports:
✅ Scalability (microservices-ready)
✅ Security (OAuth + session management)
✅ Performance (vector indexing)
✅ Maintainability (TypeScript + modular design)
✅ Extensibility (easy to add features)
