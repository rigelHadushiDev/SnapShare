import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './entities/PostLike.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { NetworkModule } from 'src/network/network.module';
import { NetworkService } from 'src/network/network.service';
import { PostAccessGuard } from './guards/PostAccess.guard';
import { StoryAcessGuard } from './guards/StoryAcess.guard';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike]), UsersModule, NetworkModule, NotificationModule],
  controllers: [LikeController],
  providers: [LikeService, UserProvider, NetworkService, PostAccessGuard, StoryAcessGuard, NotificationService],
  exports: [StoryAcessGuard, PostAccessGuard]
})
export class LikeModule { }
