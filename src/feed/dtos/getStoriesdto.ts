import { ApiProperty } from '@nestjs/swagger';

export class StoryFeedDto {
    @ApiProperty({
        description: 'Unique identifier for the story',
        example: 0,
    })
    storyId: number;

    @ApiProperty({
        description: 'Number of likes on the story',
        example: 0,
    })
    storyLikesNr: number;

    @ApiProperty({
        description: 'URL of the media associated with the story',
        example: 'http://example.com/story/media.jpg',
    })
    storyMedia: string;

    @ApiProperty({
        description: 'User ID of the story owner',
        example: 0,
    })
    storytellerUserId: number;

    @ApiProperty({
        description: 'Creation timestamp of the story',
        example: '2024-09-28T18:00:33.181Z',
    })
    storyCreatedAt: string;

    @ApiProperty({
        description: 'URL of the profile image of the storyteller',
        example: 'http://example.com/profile/image.jpg',
    })
    storyProfileImg: string;

    @ApiProperty({
        description: 'Username of the user who liked the story',
        example: 'username_example',
    })
    storyLikersUsername: string;

    @ApiProperty({
        description: 'Full name of the account',
        example: 'Full Name Example',
    })
    AccFullName: string;

    @ApiProperty({
        description: 'Indicates if the user has liked the story',
        example: 'false',
    })
    storyLikedByUser: string;

    @ApiProperty({
        description: 'List of usernames who liked the story',
        example: null,
    })
    storyLikersUsernames: string | null;

    @ApiProperty({
        description: 'Number of comments on the story',
        example: 0,
    })
    engagementCommentNr: number;

    @ApiProperty({
        description: 'Number of likes on the story',
        example: 0,
    })
    engagementLikeNr: number;

    @ApiProperty({
        description: 'Indicates if the story has been seen by the user',
        example: 'false',
    })
    seenByUser: string;
}
