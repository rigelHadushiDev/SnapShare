import { ApiProperty } from "@nestjs/swagger";

export class GetCommentRepliesRes {
    @ApiProperty({
        description: 'The depth of the comment in the thread',
        example: 2,
    })
    depth: number;

    @ApiProperty({
        description: 'The unique identifier of the comment',
        example: 15,
    })
    commentId: number;

    @ApiProperty({
        description: 'The number of likes the comment has received',
        example: 0,
    })
    commentLikeNr: number;

    @ApiProperty({
        description: 'The identifier of the parent comment',
        example: 15,
    })
    parentCommentId: number;

    @ApiProperty({
        description: 'URL of the profile image of the user who made the comment',
        example: null,
    })
    profileImg: string | null;

    @ApiProperty({
        description: 'The date and time when the comment was created',
        example: '2024-08-04T17:20:03.817Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'The ID of the post the comment belongs to',
        example: 17,
    })
    postId: number;

    @ApiProperty({
        description: 'The ID of the user who made the comment',
        example: 5,
    })
    userId: number;

    @ApiProperty({
        description: 'Full name of the user who made the comment',
        example: 'test test',
    })
    commentUserFullName: string;

    @ApiProperty({
        description: 'The text content of the comment',
        example: 'Im writing such as a bad comment! ',
    })
    commentDescription: string;

    @ApiProperty({
        description: 'The username of the user who made the comment',
        example: 'test3',
    })
    commentUserName: string;

    @ApiProperty({
        description: 'Indicates if the current user liked the comment',
        example: 'false',
    })
    LikedByUser: string;

    @ApiProperty({
        description: 'Unique identifier for the comment',
        example: '15-13',
    })
    unique_comment_id: string;

    @ApiProperty({
        description: 'Priority of the comment in sorting',
        example: 5,
    })
    priority: number;
}