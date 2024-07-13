import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment } from './entities/comment.entity';
import { PostSchema } from 'src/posts/entities/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: PostSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
