import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { authGuard } from 'src/auth/auth.guard';
import { updatePictureDto } from './dto/update-profilePicture.dto';
import { updatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @UseGuards(authGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(authGuard)
  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.usersService.findOne(id);
  }
  @UseGuards(authGuard)
  @Patch(':id')
  update(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateNameorLastname(id, updateUserDto);
  }
  @UseGuards(authGuard)
  @Delete(':id')
  remove(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.usersService.removeUserAndItsContent(id);
  }

  @UseGuards(authGuard)
  @Patch(':id/profile-picture')
  updateProfilePicture(
    @Param('id') id,
    @Body() updatePictureDto: updatePictureDto,
  ) {
    return this.usersService.updateProfilePicture(id, updatePictureDto);
  }

  @UseGuards(authGuard)
  @Patch(':id/password')
  updatePassword(
    @Param('id') id,
    @Body('password') password: updatePasswordDto,
  ) {
    return this.usersService.updatePassword(id, password);
  }
}
