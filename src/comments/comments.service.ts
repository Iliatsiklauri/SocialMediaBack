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
import { User } from 'src/users/entities/user.entity';
import { Scheduler } from 'timers/promises';

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

  //! read functions

  findAll() {
    return this.CommentsModel.find().populate([
      {
        path: 'postId',
        select: 'content author',
        populate: {
          path: 'author',
          select: 'name lastname',
        },
      },
      {
        path: 'author',
        select: 'name lastname profilePicture',
      },
    ]);
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const comment = await this.CommentsModel.findById(id);
    if (!comment) throw new BadRequestException('comment not available');
    return comment;
  }
  async findCommentsByUser(userId: mongoose.Schema.Types.ObjectId) {
    return this.CommentsModel.find({ author: userId });
  }

  //! add + update functions

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

  async update(
    id: mongoose.Schema.Types.ObjectId,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.CommentsModel.findById(id);
    if (!comment) throw new BadRequestException('comment not available');
    await this.CommentsModel.findByIdAndUpdate(id, updateCommentDto);
    return `Comment updates Successfully`;
  }

  //! delete functions

  async deleteUsersCommentsOnOtherPosts(
    userId: mongoose.Schema.Types.ObjectId,
  ) {
    const comments = await this.CommentsModel.find({ author: userId });
    for (const comment of comments) {
      await this.PostsService.removeComment(comment.postId, comment.id);
    }
    await this.CommentsModel.deleteMany({ author: userId });
  }

  async deleteCommentsWithPost(postId: mongoose.Schema.Types.ObjectId) {
    await this.CommentsModel.deleteMany({ postId });
  }

  async deleteSingleComment(commentId: mongoose.Schema.Types.ObjectId) {
    const comment = await this.CommentsModel.findById(commentId);
    if (!comment) throw new BadRequestException('no comment with this id');
    await this.PostsService.findPostByCommentAndUpdate(commentId);
    return 'Comment deleted Successfully';
  }
}
