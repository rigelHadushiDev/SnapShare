import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Profile } from 'src/profile/profile.entity';
import { Post } from 'src/post/post.entity';
import { Like } from 'src/like/like.entity';
import { Comment } from 'src/comment/comment.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
