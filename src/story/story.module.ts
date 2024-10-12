import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/user.module';
import { Story } from './story.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { StoryViews } from 'src/story/storyViews.entity';
import { NetworkService } from 'src/network/network.service';
import { NetworkModule } from 'src/network/network.module';
import { GetUserStoriesAccessGuard } from './guards/GetUserStoriesAccess.guard';
import { LikeModule } from 'src/like/like.module';
import { StoryAcessGuard } from 'src/like/guards/StoryAcess.guard';
import { PostAccessGuard } from 'src/like/guards/PostAccess.guard';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryViews]), UsersModule, NetworkModule, LikeModule, NotificationModule],
  providers: [StoryService, UserProvider, NetworkService, GetUserStoriesAccessGuard, StoryAcessGuard],
  controllers: [StoryController],
  exports: [StoryService]
})
export class StoryModule { }
