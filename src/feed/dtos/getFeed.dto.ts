import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CommentDto {
    @ApiPropertyOptional()
    depth: number;

    @ApiPropertyOptional()
    commentId: number;

    @ApiPropertyOptional()
    commentLikeNr: number;

    @ApiPropertyOptional()
    parentCommentId: number;

    @ApiPropertyOptional()
    profileImg: string;

    @ApiPropertyOptional()
    createdAt: string;

    @ApiPropertyOptional()
    postId: number;

    @ApiPropertyOptional()
    userId: number;

    @ApiPropertyOptional()
    commentUserFullName: string;

    @ApiPropertyOptional()
    commentDescription: string;

    @ApiPropertyOptional()
    commentUserName: string;

    @ApiPropertyOptional()
    LikedByUser: string;

    @ApiPropertyOptional()
    postUserId: number;

    @ApiPropertyOptional()
    unique_comment_id: string;

    @ApiPropertyOptional()
    priority: number;
}

export class PostDto {
    @ApiPropertyOptional({
        description: 'Unique identifier for the post',
        example: 30,
    })
    postId?: number;

    @ApiPropertyOptional({
        description: 'Description of the post',
        example: 'This is a sample post description.',
    })
    postDescription?: string;

    @ApiPropertyOptional({
        description: 'Number of comments on the post',
        example: 5,
    })
    postCommentsNr?: number;

    @ApiPropertyOptional({
        description: 'Number of likes on the post',
        example: 10,
    })
    postLikesNr?: number;

    @ApiPropertyOptional({
        description: 'Media URL associated with the post which you should call as an API',
        example: 'https://example.com/media/post-image.jpg',
    })
    postMedia?: string;

    @ApiPropertyOptional({
        description: 'Identifier for the user who created the post',
        example: 1,
    })
    postUserId?: number;

    @ApiPropertyOptional({
        description: 'Timestamp when the post was created',
        example: '2024-09-21T14:58:19.728Z',
    })
    postCreatedAt?: string;

    @ApiPropertyOptional({
        description: 'Profile image URL of the user who created the post',
        example: 'https://example.com/media/user-profile.jpg',
    })
    postProfileImg?: string;

    @ApiPropertyOptional({
        description: 'Username of the user who liked the post',
        example: 'rigel22111',
    })
    storyOwnerUsername?: string;

    @ApiPropertyOptional({
        description: 'Full name of the user who created the post',
        example: 'Rigel Hadushi',
    })
    AccFullName?: string;

    @ApiPropertyOptional({
        description: 'Indicates if the post is liked by the current user (true/false)',
        example: 'true',
    })
    postLikedByUser?: string;
}

export class PostWithCommentsDto {
    @ApiPropertyOptional({ type: PostDto })
    post: PostDto;

    @ApiPropertyOptional({ type: [CommentDto] })
    comments: CommentDto[];
}

export class GetFeedResp {
    @ApiProperty({ type: [PostWithCommentsDto] })
    feedContainer: PostWithCommentsDto[];
}