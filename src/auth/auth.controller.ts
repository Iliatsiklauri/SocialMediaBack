import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { authGuard } from './auth.guard';
import { CurrentUser } from 'src/users/users.decorator';
import { currentUser } from 'src/users/dto/current-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  SignUp(@Body() SignUpDto: SignUpDto) {
    return this.authService.SignUp(SignUpDto);
  }

  @Post('sign-in')
  SignIn(@Body() SignInDto: SignInDto) {
    return this.authService.SignIn(SignInDto);
  }

  @UseGuards(authGuard)
  @Get('current-user')
  CurrentUser(@CurrentUser() user: currentUser) {
    return this.authService.getCurrentUser(user);
  }
}
