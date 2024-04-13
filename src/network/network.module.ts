import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { Network } from './network.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Network])],
  providers: [NetworkService],
  controllers: [NetworkController]
})
export class NetworkModule { }
