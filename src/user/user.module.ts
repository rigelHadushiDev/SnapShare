import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserProvider } from './user.provider';



@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserProvider],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
