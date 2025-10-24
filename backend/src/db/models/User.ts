import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface IUserCreate {
  googleId: string;
  name: string;
  email: string;
  avatar?: string;
}
