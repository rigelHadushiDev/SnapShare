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
    @ApiPropertyOptional()
    postId: number;

    @ApiPropertyOptional()
    postDescription: string;

    @ApiPropertyOptional()
    postCommentsNr: number;

    @ApiPropertyOptional()
    postLikesNr: number;

    @ApiPropertyOptional()
    postMedia: string;

    @ApiPropertyOptional()
    postUserId: number;

    @ApiPropertyOptional()
    postCreatedAt: string;

    @ApiPropertyOptional()
    postProfileImg: string;

    @ApiPropertyOptional()
    postLikersUsername: string;

    @ApiPropertyOptional()
    AccFullName: string;

    @ApiPropertyOptional()
    postLikedByUser: string;

    @ApiPropertyOptional({ nullable: true })
    postLikersUsernames: string | null;
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