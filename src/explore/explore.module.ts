import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UsersModule } from 'src/user/user.module';
import { ExploreService } from './explore.service';
import { ExploreController } from './explore.controller';


@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule],
    providers: [ExploreService],
    controllers: [ExploreController],
})
export class ExploreModule { }
