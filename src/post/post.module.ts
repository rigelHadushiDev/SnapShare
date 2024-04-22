import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/user.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostService, UserProvider],
  controllers: [PostController]
})
export class PostModule { }
