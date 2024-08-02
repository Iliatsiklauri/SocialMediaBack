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
  @Prop({ type: Object, default: { imageUrl: 'No Image', filePath: '' } })
  profilePicture: {
    imageUrl: string;
    filePath: string;
  };
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  friendRequests: mongoose.Schema.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
