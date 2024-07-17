import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { updatePictureDto } from './dto/update-profilePicture.dto';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @Inject(forwardRef(() => PostsService))
    private PostService: PostsService,
    @Inject(forwardRef(() => CommentsService))
    private CommentsService: CommentsService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return this.UserModel.create(createUserDto);
  }

  //! read functions

  findAll() {
    return this.UserModel.find().select(
      '_id name lastname email profilePicture',
    );
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findById(id)
      .select('-password')
      .populate([
        {
          path: 'posts',
          populate: [
            {
              path: 'comments',
              select: 'author content',
              populate: [
                {
                  path: 'author',
                  select: 'name lastname',
                },
              ],
            },
            {
              path: 'author',
              select: 'name lastname',
            },
          ],
        },
      ]);
    if (!user) throw new BadRequestException('user does not exist');
    return user;
  }

  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  //! add + update functions

  // TODO password update case
  async update(
    id: mongoose.Schema.Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.UserModel.findById(id);
    if (!user)
      throw new BadRequestException(
        'Cannot update because user does not exist',
      );
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserDto,
    );
    return 'User updated Successfully';
  }
  async updateProfilePicture(
    id: mongoose.Schema.Types.ObjectId,
    updatePictureDto: updatePictureDto,
  ) {
    const user = await this.UserModel.findById(id);
    if (!user)
      throw new BadRequestException(
        'Cannot update because user does not exist',
      );
    user.profilePicture = updatePictureDto.profilePicture;
    await user.save();
    return 'User Deleted Succesfully';
  }

  async addPost(
    userId: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
  ) {
    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException('User does not exist with this id');
    user.posts.push(postId);
    user.save();
    return 'Post added successfully';
  }

  //! delete functions

  async removePostFromParent(postId: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findOne({ posts: postId });
    const index = user.posts.findIndex((el) => el == postId);
    user.posts.splice(index, 1);
    await user.save();
    return 'Successfully removed post from user';
  }

  async removeUserAndItsContent(userId: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException(
        'Cannot delete because user does not exist',
      );
    await this.PostService.deletePostsWithUser(userId);

    await this.CommentsService.deleteUsersCommentsOnOtherPosts(userId);

    await this.UserModel.findByIdAndDelete(userId);
    return 'User Deleted Successfully';
  }
}
