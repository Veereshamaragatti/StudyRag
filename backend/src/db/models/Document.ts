import { ObjectId } from 'mongodb';

export interface IChunk {
  text: string;
  embedding: number[];
  page?: number;
}

export interface IDocument {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  originalName: string;
  filePath: string;
  fileType: string;
  tags: string[];
  chunks: IChunk[];
  uploadedAt: Date;
  size: number;
}

export interface IDocumentCreate {
  userId: ObjectId;
  name: string;
  originalName: string;
  filePath: string;
  fileType: string;
  tags?: string[];
  chunks: IChunk[];
  size: number;
}
