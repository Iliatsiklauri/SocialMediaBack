import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private UsersService: UsersService,
    private JwtService: JwtService,
  ) {}
  async SignUp(SignUpDto: SignUpDto) {
    const { email, password } = SignUpDto;
    const existingUser = await this.UsersService.findByEmail(email);
    if (existingUser)
      throw new BadRequestException('This email is already used');

    const hashedpassword = await bcrypt.hash(password, 10);
    return { ...SignUpDto, password: hashedpassword };
  }
}
