import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class updatePictureDto {
  @ApiProperty()
  profilePicture: string;
}
