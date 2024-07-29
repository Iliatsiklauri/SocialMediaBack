import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'Name@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'Name@gmail.com', minimum: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be at least 8 characters long',
  })
  password: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'george' })
  name: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'washingtion' })
  @IsString()
  lastname: string;
}
