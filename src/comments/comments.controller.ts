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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { authGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/users/users.decorator';
import { currentUser } from 'src/users/dto/current-user.dto';
import mongoose from 'mongoose';
@UseGuards(authGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':id')
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() CurrentUser: currentUser,
    @Param()
    postId: {
      id: mongoose.Schema.Types.ObjectId;
    },
  ) {
    return this.commentsService.create(
      createCommentDto,
      CurrentUser.id,
      postId,
    );
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return;
  }
}
