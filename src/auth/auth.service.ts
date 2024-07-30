import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { currentUser } from 'src/users/dto/current-user.dto';

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
    await this.UsersService.create({ ...SignUpDto, password: hashedpassword });
    return 'User Created Succesfully';
  }

  async SignIn(SignInDto: SignInDto) {
    const { email, password } = SignInDto;
    const existingUser = await this.UsersService.findByEmail(email);
    if (!existingUser) throw new BadRequestException('User does not exist');

    const isPassEqual = await bcrypt.compare(password, existingUser.password);
    if (!isPassEqual) throw new UnauthorizedException('incorrect password');
    const JwtPayload = {
      email: existingUser.email,
      id: existingUser.id,
    };
    const accessToken = await this.JwtService.sign(JwtPayload);

    return { accessToken };
  }

  async getCurrentUser(currentUser: currentUser) {
    return currentUser;
  }
}
