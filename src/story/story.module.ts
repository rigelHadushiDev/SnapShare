import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/user.module';
import { Story } from './story.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { StoryViews } from './StoryViews.entity';
import { NetworkService } from 'src/network/network.service';
import { NetworkModule } from 'src/network/network.module';
import { GetUserStoriesAccessGuard } from './guards/GetUserStoriesAccess.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryViews]), UsersModule, NetworkModule],
  providers: [StoryService, UserProvider, NetworkService, GetUserStoriesAccessGuard],
  controllers: [StoryController],
  exports: [StoryService]
})
export class StoryModule { }
