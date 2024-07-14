import { BadRequestException } from '@nestjs/common';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  imageUrl: string;
}
