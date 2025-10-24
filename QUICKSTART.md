# 🎓 StudyRAG - Quick Setup

## Follow these steps to get your Academic RAG System running:

### Step 1: Install Dependencies

Open two PowerShell terminals in the `StudyRag` folder:

**Terminal 1 - Backend:**
```powershell
cd backend
npm install
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
```

### Step 2: Verify Environment Variables

Make sure the `.env` file in the root directory contains:
- ✅ MongoDB URI (already configured)
- ✅ Gemini API Key (already configured)
- ✅ Google OAuth credentials (already configured)
- ✅ All secrets are set

### Step 3: Start the Servers

**Terminal 1 - Backend (Port 5000):**
```powershell
cd backend
npm run dev
```

Wait for:
```
✅ Successfully connected to MongoDB Atlas!
✅ Database indexes created successfully
🚀 Server running on http://localhost:5000
```

**Terminal 2 - Frontend (Port 3000):**
```powershell
cd frontend
npm run dev
```

Wait for:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Step 4: Access the Application

1. Open your browser
2. Go to: `http://localhost:3000/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. Start using StudyRAG! 🎉

### First Steps:

1. **Upload Documents** - Go to Dashboard → Upload a PDF, DOCX, or TXT file
2. **Ask Questions** - Go to Chat → Ask questions about your documents
3. **Try Voice Input** - Click the microphone icon
4. **Upload Images** - Click the image icon to ask about images

---

## 🐛 Common Issues

### Port Already in Use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Cannot Connect to MongoDB
- Check internet connection
- Verify MongoDB URI in `.env`
- Make sure IP is whitelisted in MongoDB Atlas

### Google OAuth Not Working
- Ensure callback URL is added in Google Cloud Console
- Verify client ID and secret in `.env`
- Clear browser cookies and try again

---

## 📖 Full Documentation

See `README.md` for complete documentation including:
- Detailed architecture
- API endpoints
- Advanced features
- Security best practices
- Deployment guide

---

**Need Help?** Check the README.md or the inline code comments!
