import { ApiProperty } from '@nestjs/swagger';

export class UserStoryDto {
    @ApiProperty({
        description: 'Unique identifier for the story',
        example: 2,
    })
    storyId: number;

    @ApiProperty({
        description: 'Number of likes the story has received',
        example: 1,
    })
    storyLikesNr: number;

    @ApiProperty({
        description: 'URL of the story media (image or video)',
        example:
            'http://127.0.0.1:3000/contentMedia/display/story/80fc548c30fda72788a07581b3c31bff8ee3d1c0c64a59044822fd4ec7e733c9/a4d23c57-c887-460f-bed2-7579b80a0d05_2024_09_01_16_56_03.jpg',
    })
    storyMedia: string;

    @ApiProperty({
        description: 'ID of the user who posted the story',
        example: 2,
    })
    storyUserId: number;

    @ApiProperty({
        description: 'Timestamp when the story was created',
        example: '2024-09-07T18:33:27.000Z',
    })
    storyCreatedAt: string;

    @ApiProperty({
        description: 'URL of the profile image of the story owner',
        example:
            'http://127.0.0.1:3000/contentMedia/display/profileImg/80fc548c30fda72788a07581b3c31bff8ee3d1c0c64a59044822fd4ec7e733c9/71b8cf81-263c-4d00-aa36-d68206a7004d_2024_09_02_02_42_07.jpg',
    })
    storyProfileImg: string;

    @ApiProperty({
        description: 'Full name of the user who posted the story',
        example: '1 1',
    })
    AccFullName: string;

    @ApiProperty({
        description: 'Indicates if the story is liked by the story owner',
        example: 'true',
    })
    storyLikedByStoryOwner: string;

    @ApiProperty({
        description: 'Indicates if the current user has seen the story',
        example: 'false',
    })
    storySeenByCurrentUser: string;

    @ApiProperty({
        description: 'List of usernames of users who liked the story, if any',
        example: null,
        nullable: true,
    })
    storyLikersUsernames: string | null;
}

export class GetUserStoriesResDto {
    @ApiProperty({
        description: 'An array of user stories',
        type: [UserStoryDto],
    })
    userStoriesContainer: UserStoryDto[];
}
