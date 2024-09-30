import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { Network } from './entities/network.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/services/user.provider';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationType } from '../notification/entities/notificationType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Network, Notification, NotificationType])],
  providers: [NetworkService, UserProvider],
  controllers: [NetworkController],
  exports: [NetworkService]
})
export class NetworkModule { }
