import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { User } from './user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PostModule } from './post/post.module';
import { Post } from './post/post.entity';
import { NetworkModule } from './network/network.module';
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/comment.entity';
import { PostLike } from './like/entities/PostLike.entity';
import * as dotenv from 'dotenv';
import { Network } from './network/entities/network.entity';
import { FetchUserMiddleware } from './auth/fetchUser.middleware';
import { HttpExceptionFilter } from './common/filters/httpException.filter';
import { SSEModule } from './sse/sse.module';
import { Notification } from './notification/entities/notification.entity';
import { NotificationType } from './notification/entities/notificationType.entity';
import { StoryModule } from './story/story.module';
import { Story } from './story/story.entity';
import { StoryLike } from './like/entities/StoryLike.entity';
import { CommentLike } from './like/entities/CommentLike.entity';
import { JwtExpiredExceptionFilter } from './common/filters/JweExpiredException.filter';
import { StoryViews } from './story/StoryViews.entity';
import { FeedModule } from './feed/feed.module';
import { ExploreModule } from './explore/explore.module';
import { Engagement } from './feed/entities/engagement.entity';
import { EngagementType } from './feed/entities/engagementType.entity';
import { UserFeed } from './feed/entities/userFeed.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { NotificationModule } from './notification/notification.module';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSW,
      database: process.env.DB_NAME,
      entities: [Engagement, User, Post, Comment, PostLike, Network,
        Notification, NotificationType, Story, StoryLike, CommentLike,
        StoryViews, EngagementType, UserFeed],
      synchronize: false,
      autoLoadEntities: false
    }),
    UsersModule,
    AuthModule,
    NotificationModule,
    PostModule,
    NetworkModule,
    CommentModule,
    LikeModule,
    SSEModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 0,
      max: undefined,
    }),
    StoryModule,
    FeedModule,
    ExploreModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: JwtExpiredExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchUserMiddleware).forRoutes('*');
  }
}
