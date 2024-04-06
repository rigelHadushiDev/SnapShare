import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';


@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'topSecret',
      signOptions: { expiresIn: '100h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
