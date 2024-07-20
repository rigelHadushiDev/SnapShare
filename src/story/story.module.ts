import { Module } from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/user/user.module';
import { Story } from './story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Story]), UsersModule],
  providers: [StoryService],
  controllers: [StoryController]
})
export class StoryModule { }
