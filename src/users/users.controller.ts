import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { authGuard } from 'src/auth/auth.guard';
import { updatePictureDto } from './dto/update-profilePicture.dto';
import { updatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from './users.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/posts/aws.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private AwsService: AwsService,
  ) {}
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
  @Patch('/:id/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id,
    @Body() updatePictureDto: updatePictureDto,
  ) {
    if (!file) throw new BadRequestException('No image provided');
    updatePictureDto = await this.AwsService.uploadImage(file);
    return this.usersService.updateProfilePicture(id, updatePictureDto);
  }

  @UseGuards(authGuard)
  @Delete('/:id/profile-picture')
  async deleteProfilePicture(@Param('id') id) {
    return this.usersService.deleteProfilePicture(id);
  }

  @UseGuards(authGuard)
  @Patch(':id/password')
  updatePassword(
    @Param('id') id,
    @Body('password') password: updatePasswordDto,
  ) {
    return this.usersService.updatePassword(id, password);
  }

  @UseGuards(authGuard)
  @Post('/send-request/:id')
  sendRequest(
    @CurrentUser('id')
    senderId: {
      id: mongoose.Schema.Types.ObjectId;
    },
    @Param('id') recieverId: mongoose.Schema.Types.ObjectId,
  ) {
    return this.usersService.sendRequest(senderId.id, recieverId);
  }

  @UseGuards(authGuard)
  @Patch('/accept-request/:id')
  acceptRequest(
    @CurrentUser('id')
    recieverId: {
      id: mongoose.Schema.Types.ObjectId;
    },
    @Param('id') senderId: mongoose.Schema.Types.ObjectId,
  ) {
    return this.usersService.acceptRequest(recieverId.id, senderId);
  }

  @UseGuards(authGuard)
  @Patch('/decline-request/:id')
  declineRequest(
    @CurrentUser('id')
    recieverId: {
      id: mongoose.Schema.Types.ObjectId;
    },
    @Param('id') senderId: mongoose.Schema.Types.ObjectId,
  ) {
    return this.usersService.declineRequest(senderId, recieverId.id);
  }

  @UseGuards(authGuard)
  @Delete('/remove-friend/:id')
  removeFriend(
    @CurrentUser('id')
    recieverId: {
      id: mongoose.Schema.Types.ObjectId;
    },
    @Param('id') senderId: mongoose.Schema.Types.ObjectId,
  ) {
    return this.usersService.removeFriend(senderId, recieverId.id);
  }
}
