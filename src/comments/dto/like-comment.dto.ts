import mongoose from 'mongoose';

export class commentLike {
  commentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}
