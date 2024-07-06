import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';


export class UserInfoDto {

    @ApiProperty({ example: 'example@example.com', description: 'Email address of the user', uniqueItems: true })
    email: string;

    @ApiProperty({ example: 'my_username', description: 'Username of the user', uniqueItems: true })
    username: string;

    @ApiProperty({ example: 'profile.jpg', description: 'File path to the user\'s profile image', nullable: true })
    profileImg: string;

    @ApiProperty({ example: 'A short description about the user', description: 'Profile description of the user', nullable: true })
    profileDescription: string;

    @ApiProperty({ example: 'John', description: 'First name of the user', nullable: true, maxLength: 50 })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user', nullable: true, maxLength: 50 })
    lastName: string;

    @ApiProperty({ example: false, description: 'Flag indicating if the user profile is private' })
    isPrivate: boolean;

    @ApiProperty({ example: false, description: 'Flag indicating if the user is archived' })
    archive: boolean;

    @ApiProperty({ example: '2023-01-01T12:00:00Z', description: 'Date and time when the user was created' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-02T15:30:00Z', description: 'Date and time when the user was last updated' })
    updatedAt: Date;
}

export class CreateUserRes {

    @ApiProperty({ example: 'userCreatedSuccessfully', description: 'Message indicating the result of the user module operation' })
    message: string;

    @ApiProperty({ type: UserInfoDto, description: 'Updated user information object' })
    userInfo: UserInfoDto;
}

export class CreateUserReq {

    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;


    @ApiProperty({ example: 'username' })
    @IsNotEmpty({ message: 'Username is required' })
    @IsString({ message: 'Username must be a string' })
    username: string;

    @ApiProperty({ example: 'Password123' })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[A-Z])/, {
        message:
            'Password must contain at least one number and one uppercase letter',
    })
    password: string;
}