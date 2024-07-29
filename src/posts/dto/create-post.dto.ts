import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  content: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl: string;
}
