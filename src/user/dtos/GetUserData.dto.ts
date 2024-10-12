import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
    @ApiProperty({ example: 1, description: 'Unique identifier for the user.' })
    userId: number;

    @ApiProperty({ example: 'dummy@example.com', description: 'Email address of the user.' })
    email: string;

    @ApiProperty({ example: 'dummyuser', description: 'Username of the user.' })
    username: string;

    @ApiProperty({ example: 'http://example.com/profileImg.jpg', description: 'URL to the profile image of the user.' })
    profileImg: string;

    @ApiProperty({ example: 'This is a dummy profile description.', description: 'Profile description of the user.' })
    profileDescription: string | null;

    @ApiProperty({ example: 'John', description: 'First name of the user.' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user.' })
    lastName: string | null;

    @ApiProperty({ example: true, description: 'Indicates if the user profile is private.' })
    isPrivate: boolean;

    @ApiProperty({ example: false, description: 'Indicates if the user profile is archived.' })
    archive: boolean;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Timestamp when the user profile was created.' })
    createdAt: string;

    @ApiProperty({ example: '2024-01-02T00:00:00.000Z', description: 'Timestamp when the user profile was last updated.' })
    updatedAt: string;
}

export class GetUserDataRes {
    @ApiProperty({ type: UserInfoDto, description: 'Information about the user.' })
    userInfo: UserInfoDto;

    @ApiProperty({ example: 'connected', description: 'The follow status of the current user with respect to the other user.' })
    followStatus: string;
}
