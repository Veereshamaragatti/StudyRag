import { getDB } from '../db/mongo';
import { ObjectId } from 'mongodb';
import { generateEmbedding } from './embeddingService';

export interface RetrievalResult {
  text: string;
  score: number;
  documentId: string;
  documentName: string;
  page?: number;
  chunkIndex?: number;
}

// Cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const retrieveRelevantChunks = async (
  userId: ObjectId,
  query: string,
  topK: number = 5
): Promise<RetrievalResult[]> => {
  try {
    const db = getDB();
    const documentsCollection = db.collection('documents');

    // Try to generate embedding for the query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (embeddingError: any) {
      // If embedding fails (quota exceeded), return empty results gracefully
      if (embeddingError.message && embeddingError.message.includes('quota')) {
        console.log('⚠️  Embedding quota exceeded, skipping document retrieval');
        return [];
      }
      throw embeddingError;
    }

    // Get all documents for the user
    const userDocuments = await documentsCollection
      .find({ userId })
      .toArray();

    if (userDocuments.length === 0) {
      return [];
    }

    // Calculate similarity for all chunks
    const results: RetrievalResult[] = [];

    for (const doc of userDocuments) {
      if (!doc.chunks || doc.chunks.length === 0) continue;

      for (let i = 0; i < doc.chunks.length; i++) {
        const chunk = doc.chunks[i];
        if (!chunk.embedding || chunk.embedding.length === 0) continue;

        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

        results.push({
          text: chunk.text,
          score: similarity,
          documentId: doc._id.toString(),
          documentName: doc.name,
          page: chunk.page,
          chunkIndex: i,
        });
      }
    }

    // Sort by score and return top K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  } catch (error) {
    console.error('Error retrieving relevant chunks:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

export const searchDocuments = async (
  userId: ObjectId,
  searchQuery: string
): Promise<any[]> => {
  try {
    const db = getDB();
    const documentsCollection = db.collection('documents');

    // Text search
    const results = await documentsCollection
      .find({
        userId,
        $text: { $search: searchQuery },
      })
      .toArray();

    return results;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
};
