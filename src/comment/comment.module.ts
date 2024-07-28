import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule],
  providers: [CommentService, UserProvider],
  controllers: [CommentController]
})
export class CommentModule { }
