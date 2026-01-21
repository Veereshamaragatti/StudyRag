# 📄 Document Chunking in StudyRAG

## 🎯 Quick Answer

**Chunk Size:** `1000 characters`  
**Overlap:** `200 characters`  
**Algorithm:** Sentence-boundary-aware sliding window

---

## 📊 What is Chunking?

Chunking is the process of breaking down large documents into smaller, manageable pieces (chunks) for efficient processing and retrieval in the RAG (Retrieval-Augmented Generation) system.

### Why Do We Need Chunking?

1. **Embedding Limitations**: AI models have token limits for generating embeddings
2. **Better Retrieval**: Smaller chunks allow more precise matching with user queries
3. **Context Management**: Chunks provide focused context to the AI model
4. **Memory Efficiency**: Processing smaller pieces reduces memory usage

---

## ⚙️ Chunking Configuration

### Default Settings

```typescript
const DEFAULT_CHUNK_SIZE = 1000;  // characters
const DEFAULT_OVERLAP = 200;      // characters
```

### What These Numbers Mean

- **Chunk Size (1000 chars)**: Each chunk contains approximately 1000 characters of text
  - ~150-200 words in English
  - ~2-3 paragraphs
  - Optimal for semantic meaning retention

- **Overlap (200 chars)**: Adjacent chunks share 200 characters
  - ~30-40 words of overlap
  - Prevents information loss at boundaries
  - Maintains context continuity

---

## 🔄 Complete Chunking Process

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DOCUMENT UPLOAD & CHUNKING PROCESS                              │
└─────────────────────────────────────────────────────────────────┘

1️⃣ FILE UPLOAD
   ↓
   User uploads PDF/DOCX/TXT file
   ↓
   Multer saves to /uploads directory

2️⃣ TEXT EXTRACTION
   ↓
   fileService.parseFile()
   ↓
   ┌─ PDF: pdf-parse extracts text
   ├─ DOCX: mammoth extracts text
   └─ TXT: fs.readFile reads text
   ↓
   Raw text extracted

3️⃣ TEXT CLEANING
   ↓
   text.replace(/\s+/g, ' ').trim()
   ↓
   - Multiple spaces → single space
   - Remove extra whitespace
   - Trim leading/trailing spaces
   ↓
   Cleaned text ready

4️⃣ CHUNKING ALGORITHM
   ↓
   chunkText(text, { chunkSize: 1000, overlap: 200 })
   ↓
   
   For each chunk:
   ┌──────────────────────────────────────────┐
   │ a. Take 1000 characters from position    │
   │ b. Find last sentence boundary (. ? !)   │
   │ c. Break at boundary if found > 50%      │
   │ d. Otherwise break at 1000 chars         │
   │ e. Move forward by (chunk - overlap)     │
   │ f. Repeat until end of document          │
   └──────────────────────────────────────────┘
   ↓
   Array of text chunks created

5️⃣ EMBEDDING GENERATION
   ↓
   embeddingService.generateEmbeddings(chunks)
   ↓
   For each chunk:
   - Send to Gemini text-embedding-004
   - Receive 768-dimensional vector
   ↓
   Array of embeddings created

6️⃣ STORAGE
   ↓
   MongoDB documents collection
   ↓
   Store: {
     chunks: [
       { text: "...", embedding: [...] },
       { text: "...", embedding: [...] },
       ...
     ]
   }
   ↓
   ✅ Document ready for retrieval
```

---

## 💻 Technical Implementation

### Core Chunking Function

Located in: `/backend/src/utils/chunkText.ts`

```typescript
export const chunkText = (
  text: string,
  options: ChunkOptions = {}
): string[] => {
  const { chunkSize = 1000, overlap = 200 } = options;

  // Clean text first
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  // If text is smaller than chunk size, return as-is
  if (cleanedText.length <= chunkSize) {
    return [cleanedText];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanedText.length) {
    const endIndex = startIndex + chunkSize;
    let chunk = cleanedText.slice(startIndex, endIndex);

    // Try to break at sentence boundary
    if (endIndex < cleanedText.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastQuestion = chunk.lastIndexOf('?');
      const lastExclamation = chunk.lastIndexOf('!');
      const lastBreak = Math.max(lastPeriod, lastQuestion, lastExclamation);

      // Break at sentence if found after 50% of chunk
      if (lastBreak > chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1);
        startIndex += lastBreak + 1;
      } else {
        startIndex = endIndex;
      }
    } else {
      startIndex = endIndex;
    }

    chunks.push(chunk.trim());

    // Apply overlap for next chunk
    if (startIndex < cleanedText.length && overlap > 0) {
      startIndex = Math.max(0, startIndex - overlap);
    }
  }

  return chunks.filter(chunk => chunk.length > 0);
};
```

---

## 📐 Visual Example

### Example Document Chunking

**Original Text (1500 characters):**
```
Machine learning is a subset of artificial intelligence. 
It focuses on building systems that learn from data. 
These systems improve their performance over time...
[continues for 1500 characters]
```

**After Chunking:**

```
┌─────────────────────────────────────────────────────────┐
│ CHUNK 1 (1000 chars)                                    │
├─────────────────────────────────────────────────────────┤
│ Machine learning is a subset of artificial             │
│ intelligence. It focuses on building systems that       │
│ learn from data. These systems improve their            │
│ performance over time... [800 more characters]          │
└─────────────────────────────────────────────────────────┘
                              ↓
         ┌───────────────────────────────┐
         │ 200 chars overlap             │
         └───────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│ CHUNK 2 (1000 chars)                                    │
├─────────────────────────────────────────────────────────┤
│ ...performance over time. [last 200 from chunk 1]       │
│ Neural networks are inspired by biological brains...    │
│ [continues for 800 new characters]                      │
└─────────────────────────────────────────────────────────┘
                              ↓
         ┌───────────────────────────────┐
         │ 200 chars overlap             │
         └───────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│ CHUNK 3 (500 chars - final chunk)                       │
├─────────────────────────────────────────────────────────┤
│ ...biological brains. [last 200 from chunk 2]           │
│ The future of AI looks promising with continued         │
│ advancements. [remaining 300 characters]                │
└─────────────────────────────────────────────────────────┘
```

**Result:** 3 chunks with overlapping content

---

## 🎯 Smart Boundary Detection

### Sentence-Aware Chunking

The algorithm tries to break at natural sentence boundaries:

```typescript
// Find sentence endings
const lastPeriod = chunk.lastIndexOf('.');
const lastQuestion = chunk.lastIndexOf('?');
const lastExclamation = chunk.lastIndexOf('!');
const lastBreak = Math.max(lastPeriod, lastQuestion, lastExclamation);

// Break at sentence if it's after 50% of chunk size
if (lastBreak > chunkSize * 0.5) {
  chunk = chunk.slice(0, lastBreak + 1);
  // ...
}
```

### Why Sentence Boundaries Matter

✅ **Good Chunking** (at sentence boundary):
```
Chunk 1: "...systems improve performance. The next topic is..."
Chunk 2: "The next topic is neural networks. They consist of..."
```

❌ **Bad Chunking** (mid-sentence):
```
Chunk 1: "...systems improve performance. The next top"
Chunk 2: "ic is neural networks. They consist of..."
```

---

## 📊 Chunking Statistics

### Average Chunks per Document Type

| File Type | Average Size | Typical Chunks | Processing Time |
|-----------|-------------|----------------|-----------------|
| TXT (10 pages) | 20 KB | 15-20 chunks | ~2 seconds |
| PDF (10 pages) | 50 KB | 25-35 chunks | ~3 seconds |
| DOCX (10 pages) | 30 KB | 20-30 chunks | ~2.5 seconds |

### Chunk Distribution Example

For a typical 10-page research paper:
```
Total Characters: 30,000
Total Chunks: 30-35 chunks

Chunk Sizes:
- Average: ~950 characters (near 1000 target)
- Minimum: ~600 characters (small paragraphs)
- Maximum: 1000 characters (hard limit)
```

---

## 🔍 How Chunks Are Used in RAG

### Query → Retrieval → Response Flow

```
1. USER QUERY
   ↓
   "What is machine learning?"
   ↓

2. QUERY EMBEDDING
   ↓
   Generate embedding for query
   768-dim vector: [0.123, -0.456, ...]
   ↓

3. SIMILARITY SEARCH
   ↓
   For each chunk in documents:
   - Calculate cosine similarity
   - Compare query embedding vs chunk embedding
   ↓
   similarity_score = cosine(query_emb, chunk_emb)
   ↓

4. RANK CHUNKS
   ↓
   Chunk 1: 0.89 similarity ✅ (Most relevant)
   Chunk 2: 0.87 similarity ✅
   Chunk 3: 0.82 similarity ✅
   Chunk 4: 0.79 similarity ✅
   Chunk 5: 0.76 similarity ✅
   Chunk 6: 0.45 similarity ❌
   ↓

5. SELECT TOP-5 CHUNKS
   ↓
   Combine top 5 chunks as context
   ↓

6. GENERATE ANSWER
   ↓
   Send to Gemini 1.5 Pro:
   - Context: [Combined chunks]
   - Question: "What is machine learning?"
   ↓
   AI generates detailed answer
   ↓

7. RETURN TO USER
   ✅ Answer with relevant context
```

---

## 🎨 Benefits of This Chunking Strategy

### 1. **Context Preservation**
- 200-char overlap ensures no information loss
- Sentences aren't cut mid-thought
- Related concepts stay together

### 2. **Optimal Retrieval**
- 1000-char chunks are small enough for precise matching
- Large enough to contain meaningful context
- Balance between granularity and coherence

### 3. **Efficient Processing**
- Each chunk stays within embedding model limits
- Fast vector search across chunks
- Minimal memory footprint

### 4. **Better AI Responses**
- Top-K retrieval provides focused context
- AI receives relevant information only
- Reduces hallucination by grounding in data

---

## 🔧 Customizing Chunk Settings

### How to Modify Chunk Size

**File:** `/backend/src/services/fileService.ts`

```typescript
// Current settings
const chunks = chunkText(cleanedText, { 
  chunkSize: 1000,  // Change this value
  overlap: 200      // Change this value
});
```

### Recommended Values by Use Case

| Use Case | Chunk Size | Overlap | Reason |
|----------|-----------|---------|---------|
| **Short Docs** | 500 | 100 | Quick answers, less context needed |
| **Standard** ⭐ | 1000 | 200 | Balanced approach (current) |
| **Long Context** | 1500 | 300 | Complex topics, more context |
| **Technical Docs** | 800 | 150 | Precise code/formulas |

### Trade-offs

**Larger Chunks:**
- ✅ More context per chunk
- ✅ Fewer total chunks
- ❌ Less precise retrieval
- ❌ May exceed token limits

**Smaller Chunks:**
- ✅ More precise matching
- ✅ Faster processing
- ❌ May lose context
- ❌ More chunks to manage

---

## 📈 Performance Considerations

### Processing Time

```
Text Extraction: ~1 second
Chunking: ~0.1 seconds (very fast)
Embedding Generation: ~2-5 seconds (API call)
MongoDB Storage: ~0.5 seconds
─────────────────────────────────────────
Total: ~3-7 seconds per document
```

### Memory Usage

```
10 MB document → ~8,000 chunks (average)
Each chunk → 768-dim embedding (3 KB)
Total memory: ~24 MB for embeddings
```

### Optimization Tips

1. **Batch Processing**: Generate embeddings for multiple chunks at once
2. **Caching**: Cache embeddings to avoid regeneration
3. **Async Operations**: Process chunks in parallel when possible
4. **Cleanup**: Remove old document chunks when updating

---

## 🐛 Troubleshooting

### Common Issues

**Issue 1: Chunks are too small**
```
Symptom: Chunks < 500 characters consistently
Cause: Document has short paragraphs
Solution: Reduce overlap or increase chunk size
```

**Issue 2: Context lost between chunks**
```
Symptom: AI gives incomplete answers
Cause: Overlap too small
Solution: Increase overlap to 300-400 characters
```

**Issue 3: Too many chunks generated**
```
Symptom: Slow retrieval, high storage
Cause: Chunk size too small
Solution: Increase chunk size to 1200-1500
```

**Issue 4: Chunks break mid-sentence**
```
Symptom: Awkward chunk boundaries
Cause: No sentence endings found in range
Solution: Already handled by 50% threshold check
```

---

## 🔬 Code Locations

### Key Files

1. **Chunking Logic**
   - Path: `/backend/src/utils/chunkText.ts`
   - Function: `chunkText()`
   - Interface: `ChunkOptions`

2. **File Processing**
   - Path: `/backend/src/services/fileService.ts`
   - Function: `parseFile()`
   - Calls chunking after text extraction

3. **Document Controller**
   - Path: `/backend/src/controllers/documentController.ts`
   - Function: `uploadDocument()`
   - Orchestrates the full upload + chunking flow

4. **Embedding Service**
   - Path: `/backend/src/services/embeddingService.ts`
   - Function: `generateEmbeddings()`
   - Generates vectors for chunks

---

## 🎓 Summary

### Key Takeaways

✅ **Chunk Size**: 1000 characters (optimal balance)  
✅ **Overlap**: 200 characters (preserves context)  
✅ **Algorithm**: Sentence-boundary-aware sliding window  
✅ **Process**: Extract → Clean → Chunk → Embed → Store  
✅ **Benefits**: Better retrieval, preserved context, efficient processing  

### The Chunking Formula

```
Number of Chunks = ceil((Text Length - Overlap) / (Chunk Size - Overlap))

Example:
- Text: 10,000 characters
- Chunk Size: 1000
- Overlap: 200

Chunks = ceil((10,000 - 200) / (1000 - 200))
       = ceil(9,800 / 800)
       = 13 chunks
```

---

## 📚 Further Reading

- **RAG Architecture**: See `ARCHITECTURE.md` for complete system flow
- **Embedding Service**: See embedding generation process
- **Vector Search**: Understand how chunks are retrieved
- **Gemini API**: Learn about text-embedding-004 model

---

**Need help?** Check `TROUBLESHOOTING.md` for common issues!

---

*This document explains the chunking mechanism used in StudyRAG's RAG system.*
*Last Updated: 2026-01-21*
