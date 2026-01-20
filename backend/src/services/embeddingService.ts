import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Rate limiting configuration
const BATCH_SIZE = 5; // Process 5 embeddings at a time
const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second delay between batches
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateEmbeddingWithRetry = async (text: string, retries = MAX_RETRIES): Promise<number[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying embedding generation... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY_MS);
      return generateEmbeddingWithRetry(text, retries - 1);
    }
    console.error('Error generating embedding after retries:', error);
    throw new Error('Failed to generate embedding');
  }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  return generateEmbeddingWithRetry(text);
};

export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const embeddings: number[][] = [];
    
    // Process in batches to avoid rate limiting
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      console.log(`Processing embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);
      
      const batchEmbeddings = await Promise.all(
        batch.map(text => generateEmbeddingWithRetry(text))
      );
      
      embeddings.push(...batchEmbeddings);
      
      // Add delay between batches to respect rate limits
      if (i + BATCH_SIZE < texts.length) {
        await sleep(DELAY_BETWEEN_BATCHES_MS);
      }
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
};
