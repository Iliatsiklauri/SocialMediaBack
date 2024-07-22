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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { authGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/users/users.decorator';
import mongoose, { mongo, Mongoose } from 'mongoose';
import { currentUser } from 'src/users/dto/current-user.dto';

@UseGuards(authGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: currentUser,
  ) {
    return this.postsService.create(createPostDto, currentUser);
  }

  @Post('/like/:id')
  like(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @CurrentUser() currentUser: currentUser,
  ) {
    return this.postsService.likeAPost({
      postId: id,
      userId: currentUser.id,
    });
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.postsService.deletePost(id);
  }
}
