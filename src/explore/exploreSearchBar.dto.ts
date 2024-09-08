import { ApiProperty } from '@nestjs/swagger';

export class ExploreSearchBarDto {
    @ApiProperty({
        description: 'Unique identifier for the user',
        example: 123,
    })
    userId: number;

    @ApiProperty({
        description: 'Username of the user',
        example: 'john_doe',
    })
    username: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
    })
    lastName: string;

    @ApiProperty({
        description: 'Profile image URL of the user',
        example: 'https://example.com/profile.jpg',
    })
    profileImg: string;

    @ApiProperty({
        description: 'Connection type with the current user',
        example: 'direct',
        enum: ['direct', 'friend', 'others'],
    })
    connectionType: string;

    @ApiProperty({
        description: 'Number of followers the user has',
        example: 150,
    })
    followerCount: number;
}
