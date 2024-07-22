import mongoose from 'mongoose';

export class likePost {
  postId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}
