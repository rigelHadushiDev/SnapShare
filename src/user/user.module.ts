import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserProvider } from './services/user.provider';
import { UserMediaController } from './controllers/userMedia.controller';
import { UserMediaService } from './services/userMedia.service';
import { CommentModule } from 'src/comment/comment.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => CommentModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [UsersService, UserProvider, UserMediaService],
  exports: [UsersService, UserProvider],
  controllers: [UsersController, UserMediaController],
})
export class UsersModule { }
