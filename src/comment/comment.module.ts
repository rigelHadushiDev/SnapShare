import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { NetworkModule } from 'src/network/network.module';
import { NotificationModule } from 'src/notification/notification.module'; // Import NotificationModule
import { PostAccessGuard } from 'src/like/guards/PostAccess.guard';
import { Post } from 'src/post/post.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    forwardRef(() => UsersModule), // Keep it to resolve circular dependencies
    NetworkModule,
    forwardRef(() => NotificationModule), // Use forwardRef for NotificationModule
  ],
  providers: [CommentService, UserProvider, PostAccessGuard, NotificationService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule { }
