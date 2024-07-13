import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  likes: mongoose.Schema.Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
