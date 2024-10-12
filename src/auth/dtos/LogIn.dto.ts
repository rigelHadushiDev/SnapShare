import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class LogInReq {
    @ApiProperty({
        description: 'The username of the user',
        example: 'john_doe',
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'password123',
        minLength: 8, // Documenting the minimum length
    })
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