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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @Inject(forwardRef(() => PostsService))
    private PostService: PostsService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return this.UserModel.create(createUserDto);
  }

  findAll() {
    return this.UserModel.find().select(
      '_id name lastname email profilePicture',
    );
  }

  async findOne(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findById(id).select(
      'name lastname email id createdAt posts profilePicture friends',
    );
    if (!user) throw new BadRequestException('user does not exist');
    return user.populate({ path: 'posts' });
  }

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

  async remove(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findById(id);
    if (!user)
      throw new BadRequestException(
        'Cannot delete because user does not exist',
      );
    await this.UserModel.findByIdAndDelete(id);
    await this.PostService.reset(id);
    return 'User Deleted Successfully';
  }

  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
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
    user.save();
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

  async removeFromParent(postId: mongoose.Schema.Types.ObjectId) {
    const user = await this.UserModel.findOne({ posts: postId });
    const index = user.posts.findIndex((el) => el == postId);
    console.log(user, 'user');
    user.posts.splice(index, 1);
    return 'Successfully removed post from user';
  }
}
