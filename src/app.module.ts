import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { User } from './user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ProfileModule } from './profile/profile.module';
import { PostModule } from './post/post.module';
import { Profile } from './profile/profile.entity';
import { Post } from './post/post.entity';
import { NetworkModule } from './network/network.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/comment.entity';
import { Like } from './like/like.entity';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSW,
        database: process.env.DB_NAME,
        entities: [User, Profile, Post, Comment, Like],
        synchronize: false,
        autoLoadEntities: true
      }),
    UsersModule,
    AuthModule,
    ProfileModule,
    PostModule,
    NetworkModule,
    CommentModule,
    LikeModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,

    }]
})
export class AppModule { }