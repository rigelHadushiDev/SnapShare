import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserController } from './user.controller';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController, UserController],
})
export class UsersModule { }
