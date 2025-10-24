import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import config from '../config/env';

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectDB = async (): Promise<Db> => {
  try {
    if (db) {
      return db;
    }

    client = new MongoClient(config.mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB Atlas!');

    db = client.db('studyrag');
    
    // Create indexes for vector search
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

const createIndexes = async (database: Db) => {
  try {
    const documentsCollection = database.collection('documents');
    
    // Create index for userId
    await documentsCollection.createIndex({ userId: 1 });
    
    // Note: Text indexes are not supported with strict API mode
    // Using regular indexes instead
    await documentsCollection.createIndex({ name: 1 });
    await documentsCollection.createIndex({ tags: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('⚠️  Error creating indexes:', error);
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
};
