import { Module } from '@nestjs/common';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';
import { UsersService } from 'src/user/services/users.service';
import { IsCreatorGuard } from './guards/IsCreator.guard';
import { ContentMediaController } from './controllers/contentMedia.controller';
import { ContentMediaService } from './services/contentMedia.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  providers: [PostService, UserProvider, UsersService, IsCreatorGuard, ContentMediaService],
  controllers: [PostController, ContentMediaController],
  exports: [PostService]
})
export class PostModule { }
