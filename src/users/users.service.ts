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
import { updatePasswordDto } from './dto/update-password.dto';
import { validateObjectId } from 'src/utils';
import * as bcrypt from 'bcrypt';

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
    validateObjectId(id);
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
            {
              path: 'likes',
              select: 'name lastname',
            },
          ],
        },
        {
          path: 'friendRequests',
          select: 'name lastname',
        },
        {
          path: 'friends',
          select: 'name lastname',
        },
      ]);
    if (!user) throw new BadRequestException('user does not exist');
    return user;
  }

  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  //! add + update functions

  async sendRequest(
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
  ) {
    validateObjectId(senderId);
    validateObjectId(receiverId);

    const sender = await this.UserModel.findById(senderId);
    const receiver = await this.UserModel.findById(receiverId);

    if (receiverId == senderId)
      throw new BadRequestException('Cannot send request to yourself');

    if (!sender || !receiver) throw new BadRequestException('User not found');

    if (sender.friendRequests.includes(receiverId))
      throw new BadRequestException('User already sent you friend request');

    if (receiver.friendRequests.includes(senderId))
      throw new BadRequestException('Friend request is already sent');

    if (receiver.friends.includes(senderId))
      throw new BadRequestException('User is already your friend');

    receiver.friendRequests.push(senderId);
    await receiver.save();
    return 'friend request is sent successfully';
  }

  async acceptRequest(
    receiverId: mongoose.Schema.Types.ObjectId,
    senderId: mongoose.Schema.Types.ObjectId,
  ) {
    validateObjectId(senderId);
    validateObjectId(receiverId);
    const sender = await this.UserModel.findById(senderId);
    const receiver = await this.UserModel.findById(receiverId);
    if (!sender || !receiver) throw new BadRequestException('User not found');

    if (receiver.friends.includes(senderId))
      throw new BadRequestException('User is already your friend');

    if (!receiver.friendRequests.includes(senderId))
      throw new BadRequestException('User request not found');

    let requestIndex = receiver.friendRequests.findIndex(
      (el) => el == senderId,
    );
    if (requestIndex === -1)
      throw new BadRequestException('Friend request not found');

    receiver.friends.push(senderId);
    sender.friends.push(receiverId);
    receiver.friendRequests.splice(requestIndex, 1);

    await receiver.save();
    await sender.save();
    return {
      sender: sender.name,
      receiver: receiver.name,
      message: 'Successfully accepted request',
    };
  }

  async declineRequest(
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
  ) {
    validateObjectId(senderId);
    validateObjectId(receiverId);
    const sender = await this.UserModel.findById(senderId);
    const receiver = await this.UserModel.findById(receiverId);
    if (!sender || !receiver) throw new BadRequestException('User not found');

    if (!receiver.friendRequests.includes(senderId))
      throw new BadRequestException('User request not found');

    if (receiver.friends.includes(senderId))
      throw new BadRequestException('User is already your friend');

    let requestIndex = receiver.friendRequests.findIndex(
      (req) => req == senderId,
    );
    receiver.friendRequests.splice(requestIndex, 1);
    await receiver.save();

    return 'declinded request successfuly';
  }

  async updateNameorLastname(
    id: mongoose.Schema.Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ) {
    validateObjectId(id);
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
    validateObjectId(id);
    const user = await this.UserModel.findById(id);
    if (!user)
      throw new BadRequestException(
        'Cannot update because user does not exist',
      );
    user.profilePicture = updatePictureDto.profilePicture;
    await user.save();
    return 'User Deleted Succesfully';
  }
  async updatePassword(
    id: mongoose.Schema.Types.ObjectId,
    password: updatePasswordDto,
  ) {
    validateObjectId(id);
    const user = await this.UserModel.findById(id);
    if (!user)
      throw new BadRequestException(
        'Cannot update because user does not exist',
      );
    const newPassword = await bcrypt.hash(password, 10);
    user.password = newPassword;
    await user.save();
    return 'password changed';
  }

  async addPost(
    userId: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
  ) {
    validateObjectId(userId);
    validateObjectId(postId);
    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException('User does not exist with this id');
    user.posts.push(postId);
    user.save();
    return 'Post added successfully';
  }

  //! delete functions

  async removeFriend(
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
  ) {
    validateObjectId(senderId);
    validateObjectId(receiverId);
    const sender = await this.UserModel.findById(senderId);
    const receiver = await this.UserModel.findById(receiverId);
    if (!sender || !receiver) throw new BadRequestException('User not found');
    if (
      !sender.friends.includes(receiverId) ||
      !receiver.friends.includes(senderId)
    )
      throw new BadRequestException(
        'Cannot remove user because you are not friends',
      );

    let senderindex = receiver.friends.findIndex((req) => req == senderId);
    let receiverIndex = sender.friends.findIndex((req) => req == receiverId);

    receiver.friends.splice(senderindex, 1);
    sender.friends.splice(receiverIndex, 1);

    await receiver.save();
    await sender.save();

    return 'removed friend successfully';
  }

  async removePostFromParent(postId: mongoose.Schema.Types.ObjectId) {
    validateObjectId(postId);
    const user = await this.UserModel.findOne({ posts: postId });
    const index = user.posts.findIndex((el) => el == postId);
    user.posts.splice(index, 1);
    await user.save();
    return 'Successfully removed post from user';
  }

  async removeUserFromFriends(userId: mongoose.Schema.Types.ObjectId) {
    validateObjectId(userId);
    const user = await this.UserModel.findById(userId);
    if (!user) throw new BadRequestException('user not found');
    const friends = await this.UserModel.find({ friends: userId });
    const requestedFriends = await this.UserModel.find({
      friendRequests: userId,
    });
    for (const friend of requestedFriends) {
      let index = friend.friendRequests.findIndex((el) => el == userId);
      if (index !== -1) {
        friend.friendRequests.splice(index, 1);
        await friend.save();
      }
    }
    for (const friend of friends) {
      let index = friend.friends.findIndex((el) => el == userId);
      if (index !== -1) {
        friend.friends.splice(index, 1);
        await friend.save();
      }
    }
    return 'Successfully removed user from others friends list';
  }

  async removeUserAndItsContent(userId: mongoose.Schema.Types.ObjectId) {
    validateObjectId(userId);
    const user = await this.UserModel.findById(userId);
    if (!user)
      throw new BadRequestException(
        'Cannot delete because user does not exist',
      );
    await this.CommentsService.deleteCommentLikesWithUser(userId);

    await this.PostService.deleteLikesWithUser(userId);

    await this.CommentsService.deleteUsersCommentsOnOtherPosts(userId);

    await this.PostService.deletePostsWithUser(userId);

    await this.removeUserFromFriends(userId);

    await this.UserModel.findByIdAndDelete(userId);

    return 'User Deleted Successfully';
  }
}
