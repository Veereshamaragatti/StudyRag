# 🧪 StudyRAG Testing Guide

## Complete Testing Workflow

### 🎯 Phase 1: Installation & Setup

#### 1.1 Verify Prerequisites
```powershell
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify setup
.\verify-setup.ps1
```

#### 1.2 Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

Expected output:
- ✅ No errors during installation
- ✅ node_modules folders created in both directories

---

### 🎯 Phase 2: Backend Testing

#### 2.1 Start Backend Server
```powershell
cd backend
npm run dev
```

Expected console output:
```
✅ Successfully connected to MongoDB Atlas!
✅ Database indexes created successfully
🚀 Server running on http://localhost:5000
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
```

❌ **If you see errors:**
- Check TROUBLESHOOTING.md
- Verify .env file
- Check MongoDB Atlas access

#### 2.2 Test Health Endpoint
```powershell
# In a new terminal
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### 2.3 Test Root Endpoint
```powershell
curl http://localhost:5000/
```

Expected response:
```json
{
  "message": "🎓 Academic RAG System API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/auth/google",
    "documents": "/api/docs",
    "chat": "/api/chat"
  }
}
```

✅ **Backend is ready if:**
- Server starts without errors
- Health check returns OK
- MongoDB connection successful

---

### 🎯 Phase 3: Frontend Testing

#### 3.1 Start Frontend Server
```powershell
# In a new terminal
cd frontend
npm run dev
```

Expected console output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

#### 3.2 Access Login Page
1. Open browser: `http://localhost:3000/login`
2. Should see:
   - ✅ StudyRAG logo/title
   - ✅ "Continue with Google" button
   - ✅ Features list
   - ✅ No console errors (F12)

❌ **If you see errors:**
- Check browser console (F12)
- Verify frontend .env.local
- Make sure backend is running

✅ **Frontend is ready if:**
- Page loads without errors
- Styles are applied correctly
- Google button is visible

---

### 🎯 Phase 4: Authentication Testing

#### 4.1 Test Google Login Flow

**Steps:**
1. Click "Continue with Google"
2. Browser redirects to Google OAuth
3. Select your Google account
4. Approve permissions
5. Redirected back to `/dashboard`

**Verify:**
- ✅ User name appears in header
- ✅ "My Documents" section visible
- ✅ "Upload Document" form visible
- ✅ No errors in console

**Check MongoDB:**
```powershell
# In MongoDB Atlas web interface:
# Browse Collections → studyrag → users
# Should see a new user document with:
# - googleId
# - name
# - email
# - avatar
# - createdAt
```

#### 4.2 Test Session Persistence
1. Refresh the page (F5)
2. Should stay logged in
3. User info should still display

#### 4.3 Test Logout
1. Click "Logout" button
2. Should redirect to `/login`
3. Try accessing `/dashboard` - should redirect back to login

✅ **Authentication works if:**
- Google login redirects correctly
- User data is saved in MongoDB
- Session persists on refresh
- Logout clears session

---

### 🎯 Phase 5: Document Upload Testing

#### 5.1 Prepare Test Files

Create three test files:

**test.txt:**
```
Machine learning is a branch of artificial intelligence that focuses on building systems that can learn from data. It uses algorithms to identify patterns and make decisions with minimal human intervention.
```

**test.pdf:**
- Any PDF with text (not scanned images)
- Preferably < 5MB
- Multiple pages recommended

**test.docx:**
- Any Word document
- Contains text content

#### 5.2 Test File Upload

**Test TXT Upload:**
1. Go to Dashboard
2. Click "Choose File"
3. Select `test.txt`
4. Name: "Test Text File"
5. Tags: "test, machine-learning"
6. Click "Upload Document"

**Expected:**
- ✅ "Uploading..." message
- ✅ Progress indication
- ✅ Success message
- ✅ Document appears in list
- ✅ Shows correct metadata (size, chunks, date)

**Check Backend Console:**
```
Should see logs like:
- File received
- Parsing file
- Generating embeddings
- Storing in MongoDB
```

**Check MongoDB:**
```javascript
// In MongoDB Atlas → documents collection
// Should see new document with:
{
  userId: ObjectId(...),
  name: "Test Text File",
  tags: ["test", "machine-learning"],
  chunks: [
    {
      text: "Machine learning is...",
      embedding: [0.123, -0.456, ...] // 768 numbers
    }
  ]
}
```

**Test PDF Upload:**
- Same steps with PDF file
- Verify chunks are created
- Check page numbers in chunks

**Test DOCX Upload:**
- Same steps with DOCX file
- Verify text extraction works

#### 5.3 Test Invalid Uploads

**Test File Type Restriction:**
1. Try to upload a `.jpg` file
2. Should see error: "Only PDF, DOCX, and TXT files are allowed"

**Test File Size Limit:**
1. Try to upload a file > 10MB
2. Should see error: "File size must be less than 10MB"

✅ **Document upload works if:**
- All three file types upload successfully
- Chunks are created correctly
- Embeddings are generated
- Documents appear in MongoDB
- Invalid uploads are rejected

---

### 🎯 Phase 6: Chat/RAG Testing

#### 6.1 Basic Question Answering

**Setup:**
- Make sure test.txt is uploaded (from Phase 5)
- Go to Chat page (`/`)

**Test Questions:**

**Question 1: Direct Match**
```
What is machine learning?
```

**Expected Response:**
- ✅ Answer mentions "branch of artificial intelligence"
- ✅ Answer uses context from uploaded document
- ✅ 2-3 follow-up questions appear
- ✅ Source attribution shown

**Question 2: Related Concept**
```
How does ML use algorithms?
```

**Expected Response:**
- ✅ Answer relates to pattern identification
- ✅ Mentions "minimal human intervention"
- ✅ Follow-up questions provided

**Question 3: Outside Context**
```
What is quantum computing?
```

**Expected Response:**
- ✅ AI might answer generally
- ✅ Or acknowledge lack of context
- ✅ Still provides some information

**Verify in MongoDB:**
```javascript
// Check chats collection
{
  userId: ObjectId(...),
  messages: [
    {
      role: "user",
      content: "What is machine learning?",
      timestamp: Date(...)
    },
    {
      role: "assistant",
      content: "Machine learning is...",
      timestamp: Date(...)
    }
  ]
}
```

#### 6.2 Test Follow-up Questions

1. Ask initial question
2. Click on a follow-up question
3. Should populate input field
4. Submit and get new answer

#### 6.3 Test Conversation History

1. Ask multiple questions
2. Scroll up to see previous messages
3. Refresh page
4. Return to chat page
5. Previous messages should still be visible

#### 6.4 Test Voice Input

**Requirements:**
- Use Chrome or Edge browser
- Allow microphone permissions

**Steps:**
1. Click microphone icon
2. Should turn red and animate
3. Speak: "What is machine learning?"
4. Click microphone again to stop
5. Text should appear in input field
6. Submit question

**Expected:**
- ✅ Voice recognition works
- ✅ Text is transcribed correctly
- ✅ Question is processed normally

#### 6.5 Test Image Upload

**Prepare Test Image:**
- Screenshot of code
- Diagram or chart
- Any clear image with content

**Steps:**
1. Click image icon (📷)
2. Select test image
3. See image preview
4. Type question: "What's in this image?"
5. Click send

**Expected:**
- ✅ Image uploads successfully
- ✅ Gemini analyzes the image
- ✅ Detailed description provided
- ✅ Context from documents included if relevant

#### 6.6 Test Error Handling

**Test Network Error:**
1. Stop backend server
2. Try to ask a question
3. Should see error message
4. Restart backend
5. Should work again

**Test Empty Question:**
1. Try to send empty message
2. Send button should be disabled

✅ **Chat/RAG works if:**
- Questions get relevant answers
- Context from documents is used
- Conversation history persists
- Voice and image inputs work
- Errors are handled gracefully

---

### 🎯 Phase 7: Document Management Testing

#### 7.1 Test Document List

**Verify:**
- ✅ All uploaded documents appear
- ✅ Metadata is correct (name, size, chunks, date)
- ✅ Tags are displayed
- ✅ Sorted by upload date (newest first)

#### 7.2 Test Document Deletion

**Steps:**
1. Click delete button (🗑️) on a document
2. Confirm deletion
3. Document should disappear from list

**Verify in MongoDB:**
- Document should be removed from `documents` collection
- File should be deleted from `backend/uploads/`

**Verify in Chat:**
1. Ask question about deleted document
2. Should no longer retrieve context from it

#### 7.3 Test Multiple Documents

**Steps:**
1. Upload 3-5 different documents
2. Ask questions that span multiple documents
3. Verify answers use context from relevant documents

**Example:**
- Upload doc about Python
- Upload doc about JavaScript
- Ask: "Compare Python and JavaScript"
- Answer should reference both documents

✅ **Document management works if:**
- List updates in real-time
- Deletion works correctly
- RAG retrieves from correct documents
- Multiple document queries work

---

### 🎯 Phase 8: End-to-End Workflow Test

#### Complete User Journey:

**Scenario: New student studying AI**

1. **Login:**
   - Go to `/login`
   - Login with Google
   - Redirected to dashboard

2. **Upload Course Materials:**
   - Upload: "AI_Introduction.pdf"
   - Tags: "ai, introduction, course"
   - Upload: "ML_Algorithms.pdf"
   - Tags: "ml, algorithms, technical"
   - Upload: "Neural_Networks.txt"
   - Tags: "neural-networks, deep-learning"

3. **Study Session:**
   - Go to Chat page
   - Ask: "What are the main types of machine learning?"
   - Read answer
   - Click follow-up: "Explain supervised learning"
   - Ask: "Give me an example of neural networks"

4. **Use Different Input Methods:**
   - Use voice: "What is backpropagation?"
   - Upload diagram image: "Explain this neural network diagram"

5. **Review and Manage:**
   - Go back to Dashboard
   - See all 3 documents
   - Delete "AI_Introduction.pdf" (no longer needed)
   - Confirm deletion

6. **Continue Studying:**
   - Return to Chat
   - Previous conversation still there
   - Ask more questions about remaining documents

7. **Logout:**
   - Click Logout
   - Redirected to login page

✅ **Full workflow works if:**
- All steps complete without errors
- Data persists appropriately
- UI is responsive and clear
- No console errors throughout

---

### 🎯 Phase 9: Performance Testing

#### 9.1 Test Large Files

**Upload a large PDF (5-10MB):**
- Monitor upload time
- Check chunking time
- Verify embedding generation

**Expected:**
- Upload: < 30 seconds
- Processing: 1-2 minutes depending on size
- No timeout errors

#### 9.2 Test Many Chunks

**Upload document that creates 50+ chunks:**
- Check retrieval speed
- Verify top-K selection works

**Expected:**
- Query response: < 10 seconds
- Relevant chunks retrieved

#### 9.3 Test Concurrent Users

**Simulate multiple users:**
1. Open browser in incognito mode
2. Login with different Google account
3. Upload different documents
4. Both users should have isolated data

---

### 🎯 Phase 10: Security Testing

#### 10.1 Test Authentication Required

**Without logging in, try to access:**
```
http://localhost:5000/api/docs/list
http://localhost:5000/api/chat/history
```

**Expected:**
- ❌ 401 Unauthorized error
- ✅ Redirected to login

#### 10.2 Test Data Isolation

1. Login as User A
2. Upload documents
3. Logout
4. Login as User B
5. Should NOT see User A's documents

#### 10.3 Test File Upload Security

**Try to upload:**
- Executable files (.exe)
- Scripts (.js, .sh)
- Archives (.zip)

**Expected:**
- ❌ All rejected
- ✅ Only PDF/DOCX/TXT allowed

---

## 📊 Test Results Checklist

### Backend
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Health endpoint responds
- [ ] API endpoints protected

### Frontend
- [ ] Pages load correctly
- [ ] Styles applied properly
- [ ] No console errors
- [ ] Responsive design works

### Authentication
- [ ] Google login works
- [ ] User saved to MongoDB
- [ ] Session persists
- [ ] Logout clears session

### Documents
- [ ] PDF upload works
- [ ] DOCX upload works
- [ ] TXT upload works
- [ ] Chunking successful
- [ ] Embeddings generated
- [ ] List displays correctly
- [ ] Delete works

### Chat/RAG
- [ ] Questions get answers
- [ ] Context retrieved correctly
- [ ] Follow-ups generated
- [ ] Conversation saved
- [ ] Voice input works
- [ ] Image analysis works

### Performance
- [ ] Upload completes in reasonable time
- [ ] Queries respond quickly
- [ ] No memory leaks
- [ ] Multiple users work

### Security
- [ ] Auth required for protected routes
- [ ] Users can't see others' data
- [ ] File types restricted
- [ ] File sizes limited

---

## 🎓 Testing Best Practices

1. **Test in order:** Follow phases 1-10 sequentially
2. **Check logs:** Always monitor backend console
3. **Use DevTools:** Keep F12 open in browser
4. **Test edge cases:** Empty inputs, large files, etc.
5. **Verify data:** Check MongoDB after each operation
6. **Document issues:** Note any problems in TROUBLESHOOTING.md

---

## 🚀 Ready for Production?

Before deploying:
- [ ] All tests pass
- [ ] No console warnings
- [ ] Error handling works
- [ ] Security measures in place
- [ ] Environment variables secure
- [ ] Rate limiting implemented
- [ ] Monitoring setup
- [ ] Backup strategy defined

---

**Good luck with your testing! 🧪**
