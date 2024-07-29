import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class currentUser {
  @ApiProperty()
  email: string;
  @ApiProperty()
  id: mongoose.Schema.Types.ObjectId;
}
