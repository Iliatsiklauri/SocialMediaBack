import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  lastname: string;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Post' })
  posts: mongoose.Schema.Types.ObjectId[];
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  friends: mongoose.Schema.Types.ObjectId[];
  @Prop({ type: String, default: '' })
  profilePicture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
