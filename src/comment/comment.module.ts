import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { NetworkModule } from 'src/network/network.module';
import { PostAccessGuard } from 'src/like/guards/PostAccess.guard';
import { Post } from 'src/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post]), forwardRef(() => UsersModule), NetworkModule],
  providers: [CommentService, UserProvider, PostAccessGuard],
  controllers: [CommentController]
})
export class CommentModule { }
