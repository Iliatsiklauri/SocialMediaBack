import { ApiProperty } from '@nestjs/swagger';

export class updatePasswordDto {
  @ApiProperty()
  password: string;
}
