import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/user.module';
import { Story } from './story.entity';
import { UserProvider } from 'src/user/services/user.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Story]), UsersModule],
  providers: [StoryService, UserProvider],
  controllers: [StoryController],
  exports: [StoryService]
})
export class StoryModule { }
