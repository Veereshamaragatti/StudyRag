# 🎓 StudyRAG - Academic RAG System

A full-stack AI-powered academic assistant built with **Gemini 1.5 Pro**, **MongoDB Atlas Vector Search**, **Google OAuth 2.0**, **Node.js**, and **Next.js**.

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with your Google account
- 📄 **Document Management** - Upload and manage PDF, DOCX, and TXT files
- 🤖 **AI-Powered Q&A** - Ask questions and get contextual answers from your documents
- 🎯 **RAG (Retrieval-Augmented Generation)** - Intelligent document retrieval with vector embeddings
- 🎤 **Multimodal Input** - Support for text, images, and voice queries
- 💬 **Chat History** - Keep track of your conversations
- 🔒 **Private & Secure** - All documents are private to your account

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB Atlas (with Vector Search)
- Gemini 1.5 Pro API (multimodal AI)
- text-embedding-004 (embeddings)
- Google OAuth 2.0 (Passport.js)
- Multer (file uploads)
- pdf-parse, mammoth (document parsing)

### Frontend
- Next.js 14 (TypeScript)
- Tailwind CSS
- React Icons
- Axios
- React Markdown

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud Console account (for OAuth)
- Gemini API key

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd StudyRag
```

### 2. Backend Setup

```bash
cd backend
npm install
```

The `.env` file is already configured with:
- MongoDB URI
- Gemini API key
- Google OAuth credentials
- JWT secret

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

The `.env.local` file should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Google Cloud Console Setup

Your OAuth credentials are already in the `.env` file:
- Client ID: `153460668963-34bon9hj39h37hfg1k9eskt8quafejgl.apps.googleusercontent.com`
- Client Secret: `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`
- Callback URL: `http://localhost:5000/auth/google/callback`

Make sure this callback URL is added to your Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add `http://localhost:5000/auth/google/callback` to Authorized redirect URIs

### 5. MongoDB Atlas Setup

Your MongoDB Atlas is already configured with:
- URI: `mongodb+srv://Veeresh:Veeresh%4026@veeresh.tol18gv.mongodb.net/studyrag`
- Database: `studyrag`

The application will automatically:
- Create required collections (users, documents, chats)
- Set up indexes for efficient queries

## 🏃‍♂️ Running the Application

### Start Backend Server

```powershell
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Server

```powershell
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📱 Using the Application

### 1. Login
- Visit `http://localhost:3000/login`
- Click "Continue with Google"
- Authorize the application
- You'll be redirected to the dashboard

### 2. Upload Documents
- Go to Dashboard (`/dashboard`)
- Use the file uploader to upload PDF, DOCX, or TXT files
- Add optional tags for organization
- Documents are automatically:
  - Parsed and chunked (1000 chars/chunk, 200 chars overlap)
  - Embedded using Gemini embeddings
  - Stored in MongoDB with vector embeddings
  - 📖 See [CHUNKING.md](CHUNKING.md) for detailed chunking explanation

### 3. Chat with Your Documents
- Go to Chat page (`/`)
- Type your question in the text box
- Or click the microphone icon for voice input
- Or click the image icon to upload and ask about an image
- Get AI-powered answers based on your documents
- See suggested follow-up questions

### 4. Manage Documents
- View all uploaded documents in the dashboard
- See document metadata (size, chunks, upload date)
- Delete documents you no longer need

## 🔑 API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Documents
- `POST /api/docs/upload` - Upload document
- `GET /api/docs/list` - List all documents
- `GET /api/docs/:id` - Get document details
- `DELETE /api/docs/:id` - Delete document

### Chat
- `POST /api/chat/ask` - Ask a question
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/:id` - Get specific chat
- `DELETE /api/chat/:id` - Delete chat

## 📁 Project Structure

```
StudyRag/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry
│   │   ├── config/
│   │   │   ├── env.ts            # Environment variables
│   │   │   └── passport.ts       # Google OAuth config
│   │   ├── db/
│   │   │   ├── mongo.ts          # MongoDB connection
│   │   │   └── models/           # TypeScript interfaces
│   │   ├── services/
│   │   │   ├── geminiService.ts  # AI question answering
│   │   │   ├── embeddingService.ts  # Generate embeddings
│   │   │   ├── retrievalService.ts  # Vector search
│   │   │   └── fileService.ts    # Parse documents
│   │   ├── controllers/          # Route handlers
│   │   ├── routes/               # API routes
│   │   ├── middlewares/          # Auth middleware
│   │   └── utils/                # Helper functions
│   ├── uploads/                  # Uploaded files
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Chat page
│   │   ├── login/page.tsx       # Login page
│   │   ├── dashboard/page.tsx   # Document manager
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ChatWindow.tsx       # Main chat interface
│   │   ├── FileUploader.tsx     # Document upload
│   │   ├── MessageBubble.tsx    # Chat messages
│   │   ├── MicInput.tsx         # Voice input
│   │   └── GoogleLoginButton.tsx # OAuth button
│   ├── lib/
│   │   └── api.ts               # API client
│   └── package.json
│
└── .env                          # Environment variables
```

## 🧪 Testing

### Test with Postman

1. Login via browser first to get session cookie
2. Import the session cookie to Postman
3. Test API endpoints:

```bash
# Upload document
POST http://localhost:5000/api/docs/upload
Body: form-data with 'file' field

# Ask question
POST http://localhost:5000/api/chat/ask
Body: { "question": "What is machine learning?" }
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### MongoDB connection issues
- Check your MongoDB Atlas IP whitelist
- Verify the connection string in `.env`
- Ensure password is URL-encoded (`@` becomes `%40`)

### Google OAuth errors
- Verify redirect URI in Google Cloud Console
- Check client ID and secret in `.env`
- Make sure you're accessing from `http://localhost:3000`

### Port already in use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🔒 Security Notes

- Never commit `.env` files to public repositories
- Rotate API keys regularly
- Use HTTPS in production
- Set secure cookie flags in production
- Implement rate limiting for production

## 📄 License

MIT License - feel free to use this project for learning and development!

## 👨‍💻 Author

Built with ❤️ using Gemini 1.5 Pro and modern web technologies.

## 🙏 Acknowledgments

- Google Generative AI (Gemini)
- MongoDB Atlas
- Next.js Team
- Express.js Community
