import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './postLike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike])],
  controllers: [LikeController],
  providers: [LikeService]
})
export class LikeModule { }
