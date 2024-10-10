import { ApiProperty } from "@nestjs/swagger";

export class GetCommentResp {

    @ApiProperty({
        example: 123,
        description: 'Unique identifier of the comment',
    })
    commentId: number;

    @ApiProperty({
        example: '2024-10-10T14:30:00Z',
        description: 'Date and time when the comment was created (ISO format)',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2024-10-11T09:45:00Z',
        description: 'Date and time when the comment was last updated (ISO format)',
    })
    updatedAt: Date;

    @ApiProperty({
        example: 'This is a sample comment.',
        description: 'The content or description of the comment',
    })
    commentDescription: string;

    @ApiProperty({
        example: 456,
        description: 'Unique identifier of the post the comment is related to',
    })
    postId: number;

    @ApiProperty({
        example: 789,
        description: 'Unique identifier of the user who made the comment',
    })
    userId: number;

    @ApiProperty({
        example: 25,
        description: 'Number of likes the comment has received',
    })
    likesNr: number;

    @ApiProperty({
        example: null,
        description: 'If the comment is a reply, this contains the ID of the parent comment; otherwise, null',
        nullable: true,
    })
    parentCommentId: number;

    @ApiProperty({
        example: 'my_username',
        description: 'Username of the user who made the comment',
        uniqueItems: true
    })
    username: string;

    @ApiProperty({
        example: 'profile.jpg',
        description: 'File path or URL to the user\'s profile image',
        nullable: true
    })
    profileImg: string;
}
