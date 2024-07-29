import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class commentLike {
  @ApiProperty()
  commentId: mongoose.Schema.Types.ObjectId;
  @ApiProperty()
  userId: mongoose.Schema.Types.ObjectId;
}
