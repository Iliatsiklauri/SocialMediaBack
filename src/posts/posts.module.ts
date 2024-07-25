import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import { UsersModule } from 'src/users/users.module';
import { CommentsModule } from 'src/comments/comments.module';
import { AwsService } from './aws.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [PostsController],
  providers: [PostsService, AwsService],
  exports: [PostsService, AwsService],
})
export class PostsModule {}
