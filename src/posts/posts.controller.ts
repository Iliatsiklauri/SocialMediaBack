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
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { authGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/users/users.decorator';
import mongoose, { mongo, Mongoose } from 'mongoose';
import { currentUser } from 'src/users/dto/current-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';
import { ApiTags } from '@nestjs/swagger';
import { queryParams } from './dto/filter-post.dto';
@ApiTags('Posts')
@UseGuards(authGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly AwsService: AwsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: currentUser,
  ) {
    if (file) {
      const imageUrl = await this.AwsService.uploadImage(file);
      createPostDto.imageUrl = imageUrl;
    }
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
  findAll(@Query() query: queryParams) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: currentUser,
  ) {
    return this.postsService.update(id, updatePostDto, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @CurrentUser() currentUser: currentUser,
  ) {
    return this.postsService.deletePost(id, currentUser);
  }
}
