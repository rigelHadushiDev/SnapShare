import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class LogInReq {
    @IsString()
    username: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}

export class LogInRes {
    @ApiProperty({ description: 'Current loged user Id' })
    userId: number;

    @ApiProperty({ description: 'JWT access token' })
    access_token: string;
}