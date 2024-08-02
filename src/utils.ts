import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

export function validateObjectId(id: any) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ID format: ${id}`);
  }
}
