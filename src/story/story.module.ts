import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/user.module';
import { Story } from './story.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { StoryViews } from './StoryViews.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryViews]), UsersModule],
  providers: [StoryService, UserProvider],
  controllers: [StoryController],
  exports: [StoryService]
})
export class StoryModule { }
