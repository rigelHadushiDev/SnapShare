import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

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
        entities: [User],
        synchronize: false,
      }),
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }