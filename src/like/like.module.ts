import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './postLike.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { NetworkModule } from 'src/network/network.module';
import { NetworkService } from 'src/network/network.service';
import { PostAccessGuard } from './guards/PostAccessGuard';
import { PostModule } from 'src/post/post.module';
import { PostService } from 'src/post/services/post.service';
import { StoryAcessGuard } from './guards/StoryAcessGuard';
import { StoryModule } from 'src/story/story.module';
import { StoryService } from 'src/story/story.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike]), UsersModule, NetworkModule, PostModule, StoryModule],
  controllers: [LikeController],
  providers: [LikeService, UserProvider, NetworkService, PostService, StoryService, PostAccessGuard, StoryAcessGuard]
})
export class LikeModule { }
