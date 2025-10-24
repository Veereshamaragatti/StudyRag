# 🔧 StudyRAG Troubleshooting Guide

## Common Issues and Solutions

### 🚨 Installation Issues

#### Problem: `npm install` fails
```
Error: Cannot find module 'xyz'
```

**Solutions:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

#### Problem: Node.js version mismatch
```
Error: This version requires Node.js 18+
```

**Solution:**
```powershell
# Check your Node.js version
node --version

# If below 18, download and install from nodejs.org
# Recommended: Node.js 20 LTS
```

---

### 🔐 Authentication Issues

#### Problem: Google OAuth not working
```
Error: redirect_uri_mismatch
```

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `http://localhost:5000/auth/google/callback`
5. Save and wait 5 minutes for changes to propagate

#### Problem: "Unauthorized" after login
```
Error 401: Unauthorized
```

**Solutions:**
```powershell
# 1. Check if backend is running
# Backend should be on http://localhost:5000

# 2. Verify CORS settings in backend
# Frontend URL should be http://localhost:3000

# 3. Clear browser cookies
# In browser: Press F12 → Application → Cookies → Clear All

# 4. Check session secret in .env
# Make sure SESSION_SECRET is set
```

#### Problem: Session not persisting
**Solutions:**
- Enable third-party cookies in browser
- Check that `withCredentials: true` is set in frontend API calls
- Verify session middleware is configured in backend

---

### 🗄️ Database Issues

#### Problem: MongoDB connection fails
```
Error: MongoServerError: bad auth
```

**Solutions:**
```powershell
# 1. Check MongoDB URI encoding
# Password special characters must be URL-encoded
# @ becomes %40
# # becomes %23

# 2. Verify IP whitelist in MongoDB Atlas
# Go to MongoDB Atlas → Network Access
# Add your IP: 0.0.0.0/0 (for development only!)

# 3. Check username/password
# Username: Veeresh
# Password: Veeresh@26 (encoded as Veeresh%4026)
```

#### Problem: Database not found
```
Error: Database 'studyrag' not found
```

**Solution:**
```javascript
// The database is created automatically
// Just make sure the connection string includes:
// mongodb+srv://user:pass@cluster.mongodb.net/studyrag
//                                              ^^^^^^^^
//                                            database name
```

---

### 📁 File Upload Issues

#### Problem: File upload fails
```
Error: File too large
```

**Solutions:**
```powershell
# Check file size (must be < 10MB)
# Check file type (PDF, DOCX, TXT only)

# If file is valid, check backend logs:
cd backend
npm run dev
# Look for detailed error messages
```

#### Problem: "No such file or directory"
```
Error: ENOENT: no such file or directory, open 'uploads/xyz.pdf'
```

**Solution:**
```powershell
# Create uploads directory
cd backend
New-Item -ItemType Directory -Path uploads
New-Item -ItemType Directory -Path uploads/temp
```

#### Problem: PDF parsing fails
```
Error: Failed to parse PDF
```

**Solution:**
```powershell
# Make sure pdf-parse is installed
cd backend
npm install pdf-parse --save

# If still failing, the PDF might be:
# - Corrupted
# - Password protected
# - Scanned images without OCR
```

---

### 🤖 AI/Gemini Issues

#### Problem: Gemini API error
```
Error: 429 Too Many Requests
```

**Solution:**
- You've hit the rate limit
- Wait a few minutes
- Consider implementing rate limiting in your app

#### Problem: Invalid API key
```
Error: 403 Forbidden - Invalid API key
```

**Solution:**
```powershell
# Verify API key in .env
GEMINI_API_KEY=AIzaSyDL7ydePj09cUkZyI4wkjgOCjz6t3KvHcA

# Test key with curl:
curl "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY" `
  -H 'Content-Type: application/json' `
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### Problem: Embeddings not generating
```
Error: Failed to generate embedding
```

**Solution:**
```powershell
# Check if text-embedding-004 model is available
# Try switching to a different embedding model

# In embeddingService.ts, change:
model: 'text-embedding-004'
# to:
model: 'embedding-001'  # older but stable
```

---

### 💬 Chat Issues

#### Problem: No responses from chat
```
Chat loads but questions don't get answered
```

**Solutions:**
1. **Check if documents are uploaded**
   - Go to dashboard
   - Upload at least one document
   - Verify it appears in the list

2. **Check backend logs**
   ```powershell
   cd backend
   npm run dev
   # Watch for errors when asking questions
   ```

3. **Test Gemini API directly**
   - Visit: https://aistudio.google.com/app/prompts/new_chat
   - Try the same question there

#### Problem: Follow-up questions not appearing
**Solution:**
- This is normal if Gemini doesn't generate them
- The AI decides whether follow-ups are relevant
- Check the prompt format in geminiService.ts

---

### 🎤 Voice Input Issues

#### Problem: Microphone not working
```
Speech recognition is not supported
```

**Solutions:**
1. **Use Chrome or Edge**
   - Safari and Firefox have limited support
   - Chrome has the best Web Speech API support

2. **Check browser permissions**
   - Allow microphone access when prompted
   - Check: Browser Settings → Privacy → Microphone

3. **Use HTTPS in production**
   - Web Speech API requires HTTPS
   - localhost works with HTTP for testing

---

### 🖼️ Image Upload Issues

#### Problem: Image upload fails
```
Error: Invalid file type
```

**Solution:**
```powershell
# Supported formats: JPEG, PNG, WebP
# Max size: 5MB

# Check file type:
# Right-click file → Properties → Type
```

#### Problem: Image analysis not working
**Solution:**
- Ensure you're using `gemini-1.5-pro` (not `gemini-pro`)
- Only the 1.5 model supports vision
- Check image is clear and readable

---

### 🌐 Port Issues

#### Problem: Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
# Note the PID (last column)
taskkill /PID <PID> /F

# Or use a different port in .env:
PORT=5001
```

#### Problem: Frontend can't connect to backend
```
Error: Network Error
```

**Solutions:**
1. **Check backend is running**
   ```powershell
   # Test backend directly:
   curl http://localhost:5000/health
   ```

2. **Check CORS settings**
   ```typescript
   // In backend/src/index.ts
   cors({
     origin: 'http://localhost:3000',  // Must match frontend
     credentials: true
   })
   ```

3. **Check .env.local in frontend**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

---

### 🎨 Frontend Issues

#### Problem: Styles not loading
```
Tailwind CSS not working
```

**Solution:**
```powershell
cd frontend

# Rebuild
npm run build
npm run dev

# Check postcss.config.js and tailwind.config.js exist
```

#### Problem: "Cannot find module '@/lib/api'"
**Solution:**
```powershell
# Check tsconfig.json has paths configured:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### 📊 Performance Issues

#### Problem: Slow document processing
**Causes:**
- Large files (> 5MB)
- Many chunks (> 100)
- Slow embedding generation

**Solutions:**
- Split large documents
- Increase chunk size in `chunkText.ts`
- Implement batch processing

#### Problem: Chat responses are slow
**Solutions:**
- Reduce number of retrieved chunks (change topK from 5 to 3)
- Use shorter context
- Implement streaming responses

---

### 🔍 Debugging Tips

#### Enable detailed logging

**Backend:**
```typescript
// Add to any service file
console.log('Debug:', { variable, value });

// In express error handler (index.ts)
app.use((err, req, res, next) => {
  console.error('Full error:', err);
  console.error('Stack:', err.stack);
  // ...
});
```

**Frontend:**
```typescript
// In any component
console.log('State:', { messages, loading });

// In API calls (lib/api.ts)
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response);
    throw error;
  }
);
```

#### Check browser console
```
F12 → Console tab
Look for red error messages
```

#### Check backend terminal
```
Watch the terminal running npm run dev
Errors will appear in real-time
```

#### Use network tab
```
F12 → Network tab
Filter by XHR/Fetch
Check request/response details
```

---

### 🆘 Still Having Issues?

#### Checklist before asking for help:

- [ ] Both backend and frontend are running
- [ ] No errors in backend terminal
- [ ] No errors in browser console (F12)
- [ ] MongoDB Atlas is accessible
- [ ] Google OAuth redirect URI is configured
- [ ] All environment variables are set
- [ ] File permissions are correct
- [ ] Node.js version is 18+
- [ ] Internet connection is working
- [ ] Gemini API key is valid

#### Get detailed error info:

```powershell
# Backend logs
cd backend
npm run dev 2>&1 | Tee-Object -FilePath backend-log.txt

# Frontend logs
cd frontend
npm run dev 2>&1 | Tee-Object -FilePath frontend-log.txt
```

#### Test each component:

```powershell
# 1. Test MongoDB connection
cd backend
node -e "require('./dist/db/mongo').connectDB().then(() => console.log('OK'))"

# 2. Test Gemini API
curl "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=YOUR_KEY" `
  -H "Content-Type: application/json" `
  -d "{\"contents\":[{\"parts\":[{\"text\":\"test\"}]}]}"

# 3. Test Google OAuth
# Just visit: http://localhost:5000/auth/google
```

---

### 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Passport.js Guide](http://www.passportjs.org/docs/)

---

**Remember:** Most issues are due to:
1. Missing environment variables
2. Ports already in use
3. CORS misconfiguration
4. Authentication cookies

Check these first! 🎯
