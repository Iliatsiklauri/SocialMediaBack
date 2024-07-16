import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './entities/comment.entity';
import mongoose, { Model } from 'mongoose';
import { PostsService } from 'src/posts/posts.service';
import { authGuard } from 'src/auth/auth.guard';
import { UsersService } from 'src/users/users.service';
import path from 'path';

@UseGuards(authGuard)
@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly CommentsModel: Model<Comment>,
    @Inject(forwardRef(() => PostsService))
    private readonly PostsService: PostsService,
    @Inject(forwardRef(() => UsersService))
    private readonly UsersService: UsersService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: mongoose.Schema.Types.ObjectId,
    postId: {
      id: mongoose.Schema.Types.ObjectId;
    },
  ) {
    const user = await this.UsersService.findOne(userId);
    const post = await this.PostsService.findOne(postId.id);
    if (!user || !post) throw new BadRequestException('Invalid post or user');

    const comment = await this.CommentsModel.create({
      ...createCommentDto,
      author: userId,
      postId: postId.id,
    });
    await this.PostsService.addComment(postId.id, comment.id);

    return 'Comment created Successfully';
  }

  findAll() {
    return this.CommentsModel.find().populate({
      path: 'postId author',
      select: 'content imageUrl name lastname author',
    });
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const comment = await this.CommentsModel.findById(id);
    if (!comment) throw new BadRequestException('comment not available');
    return comment;
  }

  async update(
    id: mongoose.Schema.Types.ObjectId,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.CommentsModel.findById(id);
    if (!comment) throw new BadRequestException('comment not available');
    await this.CommentsModel.findByIdAndUpdate(id, updateCommentDto);
    return `This action updates a #${id} comment`;
  }

  async remove(id: mongoose.Schema.Types.ObjectId) {
    return;
  }
  async postDeleted(id: mongoose.Schema.Types.ObjectId) {
    await this.CommentsModel.deleteMany({ postId: id });
    return 'success';
  }
  async userDeleted(id: mongoose.Schema.Types.ObjectId) {
    const comments = await this.CommentsModel.find({ author: id });
    if (!comments) throw new BadRequestException('no comments');
    for (const comment of comments) {
      await this.PostsService.removeComment(comment.postId, comment._id);
    }
    await this.CommentsModel.deleteMany({ author: id });
    return 'User comments deleted successfully';
  }
}
