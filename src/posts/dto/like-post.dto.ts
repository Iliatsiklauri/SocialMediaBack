import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class likePost {
  @ApiProperty()
  postId: mongoose.Schema.Types.ObjectId;
  @ApiProperty()
  userId: mongoose.Schema.Types.ObjectId;
}
