import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { currentUser } from 'src/users/dto/current-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './entities/post.entity';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: Model<Post>,
    private UsersService: UsersService,
  ) {}
  async create(createPostDto: CreatePostDto, currentUser: currentUser) {
    if (!createPostDto.content && !createPostDto.imageUrl)
      throw new BadRequestException('Either image or title must be provided');
    const post = await this.PostModel.create({
      ...createPostDto,
      author: currentUser.id,
    });
    await this.UsersService.addPost(currentUser.id, post.id);

    return 'post created successfully';
  }

  async findAll() {
    return await this.PostModel.find().populate({
      path: 'author',
      select: 'name lastname profilePicture',
    });
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const post = await this.PostModel.findById(id);
    if (!post)
      throw new BadRequestException('Post does not exist with this id');
    return post.populate({
      path: 'author',
      select: 'name lastname profilePicture',
    });
  }

  update(id: mongoose.Schema.Types.ObjectId, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: mongoose.Schema.Types.ObjectId) {
    return `This action removes a #${id} post`;
  }
}
