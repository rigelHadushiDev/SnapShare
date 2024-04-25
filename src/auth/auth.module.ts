import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';
import * as dotenv from 'dotenv';
import { UsersService } from 'src/user/users.service';
dotenv.config();

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '100h' },
    })
  ],
  providers: [AuthService, UsersService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
