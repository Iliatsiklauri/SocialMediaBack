import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { currentUser } from 'src/users/dto/current-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './entities/post.entity';
import mongoose, { Model } from 'mongoose';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: Model<Post>,
    @Inject(forwardRef(() => UsersService))
    private UsersService: UsersService,
    @Inject(forwardRef(() => CommentsService))
    private CommentsService: CommentsService,
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

  //! read functions

  async findAll() {
    return await this.PostModel.find().populate([
      { path: 'author', select: 'name lastname' },
      {
        path: 'comments',
        select: 'author content',
        populate: { path: 'author', select: 'name lastname' },
      },
    ]);
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const post = await this.PostModel.findById(id);
    if (!post)
      throw new BadRequestException('Post does not exist with this id');
    return post;
  }

  async findPostsByUser(userId: mongoose.Schema.Types.ObjectId) {
    return this.PostModel.find({ author: userId });
  }

  async findPostByCommentId(userId: mongoose.Schema.Types.ObjectId) {
    const posts = await this.PostModel.find({ comments: userId });
    return posts;
  }
  //! add + update functions

  async update(
    id: mongoose.Schema.Types.ObjectId,
    updatePostDto: UpdatePostDto,
  ) {
    const obj = await this.PostModel.findById(id);
    if (!obj) throw new BadRequestException('There is no post with this Id');
    await this.PostModel.findByIdAndUpdate(id, updatePostDto);
    return 'Post updated Successfully';
  }

  async addComment(
    postId: mongoose.Schema.Types.ObjectId,
    commentId: mongoose.Schema.Types.ObjectId,
  ) {
    const post = await this.PostModel.findById(postId);
    post.comments.push(commentId);
    await post.save();

    return 'Successfully added commentId in Posts comments array';
  }

  async findPostByCommentAndUpdate(commentId: mongoose.Schema.Types.ObjectId) {
    const post = await this.PostModel.findOne({ comments: commentId });
    const index = post.comments.findIndex((el) => el == commentId);
    if (index == -1)
      throw new BadRequestException('Comment is not available with this id');
    post.comments.splice(index, 1);
    await post.save();
    return 'Comment removed from post succesfully';
  }

  //! delete functions

  async deletePost(id: mongoose.Schema.Types.ObjectId) {
    const obj = await this.PostModel.findById(id);
    if (!obj)
      throw new BadRequestException(
        'Cannot delete because post does not exist ',
      );
    await this.UsersService.removePostFromParent(id);
    await this.CommentsService.deleteCommentsWithPost(id);
    await this.PostModel.findByIdAndDelete(id);
    return 'Post deleted Successfully';
  }

  async deletePostsWithUser(userId: mongoose.Schema.Types.ObjectId) {
    const posts = await this.PostModel.find({ author: userId });
    for (const post of posts) {
      await this.CommentsService.deleteCommentsWithPost(post.id);
    }
    await this.PostModel.deleteMany({ author: userId });
  }

  //! helper function of delete

  async removeComment(
    postId: mongoose.Schema.Types.ObjectId,
    commentId: mongoose.Schema.Types.ObjectId,
  ) {
    const post = await this.PostModel.findById(postId);
    if (!post)
      throw new BadRequestException('Post does not exist with this id');

    const index = post.comments.indexOf(commentId);
    if (index === -1)
      throw new BadRequestException('Comment not found in post');

    post.comments.splice(index, 1);
    await post.save();
    return 'Successfully removed comment from post comments array';
  }
}
