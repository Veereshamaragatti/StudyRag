import { ObjectId } from 'mongodb';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
}

export interface IChat {
  _id?: ObjectId;
  userId: ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatCreate {
  userId: ObjectId;
  messages?: IMessage[];
}
