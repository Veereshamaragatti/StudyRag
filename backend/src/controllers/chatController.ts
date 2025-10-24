import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/mongo';
import { IChat, IMessage } from '../db/models/Chat';
import { retrieveRelevantChunks } from '../services/retrievalService';
import { askGemini, askGeminiWithImage } from '../services/geminiService';
import fs from 'fs/promises';

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { question, chatId } = req.body;
    const imageFile = req.file;

    if (!question && !imageFile) {
      return res.status(400).json({ error: 'Question or image is required' });
    }

    const db = getDB();
    const chatsCollection = db.collection<IChat>('chats');

    // Get or create chat
    let chat: IChat | null = null;
    if (chatId) {
      chat = await chatsCollection.findOne({
        _id: new ObjectId(chatId),
        userId: new ObjectId(userId),
      });
    }

    if (!chat) {
      // Create new chat
      const newChat: IChat = {
        userId: new ObjectId(userId),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await chatsCollection.insertOne(newChat);
      chat = { ...newChat, _id: result.insertedId };
    }

    // Retrieve relevant chunks from user's documents
    const relevantChunks = await retrieveRelevantChunks(
      new ObjectId(userId),
      question || 'Analyze this image',
      5
    );

    const context = relevantChunks.map(chunk => chunk.text);

    // Get conversation history (last 5 messages)
    const conversationHistory = chat.messages
      .slice(-5)
      .map(msg => ({ role: msg.role, content: msg.content }));

    // Ask Gemini
    let response;
    if (imageFile) {
      const imageData = await fs.readFile(imageFile.path);
      response = await askGeminiWithImage(
        question || 'What is in this image?',
        imageData,
        imageFile.mimetype,
        context
      );
      // Delete temporary image file
      await fs.unlink(imageFile.path);
    } else {
      response = await askGemini(question, context, conversationHistory);
    }

    // Add messages to chat
    const userMessage: IMessage = {
      role: 'user',
      content: question || 'Image query',
      timestamp: new Date(),
      imageUrl: imageFile ? imageFile.filename : undefined,
    };

    const assistantMessage: IMessage = {
      role: 'assistant',
      content: response.answer,
      timestamp: new Date(),
    };

    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $push: { messages: { $each: [userMessage, assistantMessage] } },
        $set: { updatedAt: new Date() },
      }
    );

    res.json({
      chatId: chat._id,
      answer: response.answer,
      followUpQuestions: response.followUpQuestions,
      sources: relevantChunks.map(chunk => ({
        documentName: chunk.documentName,
        score: chunk.score,
      })),
    });
  } catch (error) {
    console.error('Error asking question:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = getDB();
    const chatsCollection = db.collection('chats');

    const chats = await chatsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({ chats });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

export const getChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const chatId = req.params.id;

    const db = getDB();
    const chatsCollection = db.collection('chats');

    const chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const chatId = req.params.id;

    const db = getDB();
    const chatsCollection = db.collection('chats');

    const result = await chatsCollection.deleteOne({
      _id: new ObjectId(chatId),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
