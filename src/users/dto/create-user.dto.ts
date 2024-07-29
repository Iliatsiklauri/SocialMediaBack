import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be at least 8 characters long',
  })
  @ApiProperty()
  password: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastname: string;
}
