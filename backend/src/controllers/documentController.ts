import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs/promises';
import { getDB } from '../db/mongo';
import { IDocument, IDocumentCreate } from '../db/models/Document';
import { parseFile, deleteFile } from '../services/fileService';
import { generateEmbeddings } from '../services/embeddingService';
import config from '../config/env';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the file
    const parsed = await parseFile(file.path, file.mimetype);

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(parsed.chunks);

    // Create chunks with embeddings
    const chunks = parsed.chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
    }));

    // Create document
    const db = getDB();
    const documentsCollection = db.collection<IDocument>('documents');

    const tags = req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : [];

    const document: IDocumentCreate = {
      userId: new ObjectId(userId),
      name: req.body.name || file.originalname,
      originalName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      tags,
      chunks,
      size: file.size,
    };

    const result = await documentsCollection.insertOne({
      ...document,
      uploadedAt: new Date(),
    } as IDocument);

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: result.insertedId,
      chunksCount: chunks.length,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = getDB();
    const documentsCollection = db.collection('documents');

    const documents = await documentsCollection
      .find(
        { userId: new ObjectId(userId) },
        {
          projection: {
            name: 1,
            originalName: 1,
            fileType: 1,
            tags: 1,
            size: 1,
            uploadedAt: 1,
            chunksCount: { $size: '$chunks' },
          },
        }
      )
      .sort({ uploadedAt: -1 })
      .toArray();

    res.json({ documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const documentId = req.params.id;

    const db = getDB();
    const documentsCollection = db.collection('documents');

    // Find the document
    const document = await documentsCollection.findOne({
      _id: new ObjectId(documentId),
      userId: new ObjectId(userId),
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete the file from disk
    await deleteFile(document.filePath);

    // Delete from database
    await documentsCollection.deleteOne({ _id: new ObjectId(documentId) });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const documentId = req.params.id;

    const db = getDB();
    const documentsCollection = db.collection('documents');

    const document = await documentsCollection.findOne(
      {
        _id: new ObjectId(documentId),
        userId: new ObjectId(userId),
      },
      {
        projection: {
          name: 1,
          originalName: 1,
          fileType: 1,
          tags: 1,
          size: 1,
          uploadedAt: 1,
          chunksCount: { $size: '$chunks' },
        },
      }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};
