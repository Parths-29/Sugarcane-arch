import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  village: string;
  language: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  village: { type: String, default: '' },
  language: { type: String, default: 'en' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
