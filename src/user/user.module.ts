import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserProvider } from './services/user.provider';
import { UserMediaController } from './controllers/userMedia.controller';
import { UserMediaService } from './services/userMedia.service';



@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserProvider, UserMediaService],
  exports: [UsersService],
  controllers: [UsersController, UserMediaController],
})
export class UsersModule { }
