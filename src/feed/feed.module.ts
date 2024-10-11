import { Module } from '@nestjs/common';
import { PostService } from 'src/post/services/post.service';
import { PostController } from 'src/post/controllers/post.controller';
import { Post } from 'src/post/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { UsersService } from 'src/user/services/users.service';
import { IsCreatorGuard } from 'src/post/guards/IsCreator.guard';
import { CommentModule } from 'src/comment/comment.module';
import { CommentService } from 'src/comment/comment.service';
import { StoryViews } from 'src/story/storyViews.entity';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Story } from 'src/story/story.entity';
import { UserFeed } from './entities/userFeed.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [TypeOrmModule.forFeature([Post, StoryViews, Story, UserFeed]), UsersModule, CommentModule, NotificationModule],
    providers: [PostService, UserProvider, UsersService, IsCreatorGuard, FeedService, CommentService, NotificationService],
    controllers: [FeedController],
})
export class FeedModule { }
