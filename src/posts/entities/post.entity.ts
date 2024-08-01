import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  id: mongoose.Schema.Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: mongoose.Schema.Types.ObjectId;
  @Prop({ default: 'No Image' })
  imageUrl: string;
  @Prop({ default: '' })
  filePath: string;
  @Prop({ default: 'No Text' })
  content: string;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  likes: mongoose.Schema.Types.ObjectId[];
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Comment' })
  comments: mongoose.Schema.Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
