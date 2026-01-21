# ✂️ Quick Chunking Reference

## 📌 Quick Answer

**Question:** What is the chunk size and chunking process?

**Answer:**
- **Chunk Size:** 1000 characters
- **Overlap:** 200 characters between chunks
- **Algorithm:** Sentence-boundary-aware sliding window

---

## 🔄 Chunking Process (Short Version)

### 6-Step Process

1. **Upload File** → User uploads PDF/DOCX/TXT file

2. **Extract Text** → System extracts raw text from the document

3. **Clean Text** → Remove extra whitespace and normalize formatting

4. **Chunk Text** → Break into 1000-character chunks with 200-character overlap
   - Attempts to break at sentence boundaries (., ?, !)
   - If no sentence boundary found after 50% of chunk, breaks at 1000 chars

5. **Generate Embeddings** → Each chunk is converted to a 768-dimensional vector using Gemini's text-embedding-004

6. **Store in MongoDB** → Chunks and their embeddings are stored for retrieval

---

## 📊 Visual Summary

```
Document (30,000 chars)
         ↓
    Extract Text
         ↓
    Clean Text
         ↓
   Chunk Algorithm
    (1000 chars,
    200 overlap)
         ↓
  ~30-35 Chunks Created
         ↓
 Generate Embeddings
 (text-embedding-004)
         ↓
Store in MongoDB
(chunks + embeddings)
         ↓
  ✅ Ready for Retrieval
```

---

## 🎯 Key Benefits

- **Better Retrieval**: Smaller chunks = more precise matching
- **Context Preservation**: 200-char overlap prevents information loss
- **Optimal Size**: 1000 chars balances context and precision
- **Smart Boundaries**: Breaks at sentences, not mid-word

---

## 📚 Full Documentation

For complete details, see **[CHUNKING.md](CHUNKING.md)** which includes:
- Detailed explanations
- Code examples
- Visual diagrams
- Performance considerations
- Customization guide
- Troubleshooting tips

---

## 🔍 Where to Find Chunking Code

- **Main Logic:** `/backend/src/utils/chunkText.ts`
- **File Processing:** `/backend/src/services/fileService.ts`
- **Document Upload:** `/backend/src/controllers/documentController.ts`

---

## 💡 Example

**Input Document:** 3,000 characters

**Output:**
- Chunk 1: chars 0-1000 (1000 chars)
- Chunk 2: chars 800-1800 (1000 chars, 200 overlap with chunk 1)
- Chunk 3: chars 1600-2600 (1000 chars, 200 overlap with chunk 2)
- Chunk 4: chars 2400-3000 (600 chars, 200 overlap with chunk 3)

**Total:** 4 chunks with overlapping content

---

*For more information, see [CHUNKING.md](CHUNKING.md)*
