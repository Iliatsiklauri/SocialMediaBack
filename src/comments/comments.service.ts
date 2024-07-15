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

@UseGuards(authGuard)
@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModule: Model<Comment>,
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

    return 'good';
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
