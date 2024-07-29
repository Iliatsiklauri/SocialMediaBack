import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'Name@gmail.com' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: '12345678', minimum: 8 })
  @IsNotEmpty()
  password: string;
}
