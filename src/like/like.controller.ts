import { Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { PostAccessGuard } from './guards/PostAccess.guard';
import { StoryAcessGuard } from './guards/StoryAcess.guard';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { UserListRes } from 'src/network/responses/UserListRes';


@ApiTags('Like APIs')
@ApiBearerAuth()
@Controller('like')
export class LikeController {

    constructor(private readonly likeService: LikeService) { }


    @UseGuards(StoryAcessGuard)
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users stories that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found . [key: "usertNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'User is not found . [key: "userNotFound" ]' })
    @ApiParam({ name: 'storyId', description: 'ID of the story to be liked' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Successfully toggled story like status. [key: "storyLikeAdded or storyLikeRemoved"]', type: GeneralResponse
    })
    @ApiOperation({ summary: 'API for story like toggle.', description: 'Like or unlike a story.' })
    @Post('story/:storyId')
    @HttpCode(HttpStatus.OK)
    likeStory(@Param('storyId') storyId: number) {
        return this.likeService.toggleStoryLike(storyId);
    }

    @UseGuards(PostAccessGuard)
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users posts that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found . [key: "postNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'User is not found . [key: "userNotFound" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post to be liked' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Successfully toggled post like status. [key: "postLikeAdded or postLikeRemoved"]', type: GeneralResponse
    })
    @Post('post/:postId')
    @ApiOperation({ summary: 'API for post like toggle.', description: 'Like or unlike a post.' })
    @HttpCode(HttpStatus.OK)
    likePost(@Param('postId') postId: number) {
        return this.likeService.togglePostLike(postId);
    }

    @ApiException(() => NotFoundException, { description: 'Comment is not found . [key: "commentNotFound" ]' })
    @ApiParam({ name: 'commentId', description: 'ID of the comment to be liked' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Successfully toggled comment like status. [key: "commentLikeAdded or commentLikeRemoved"]', type: GeneralResponse
    })
    @Post('comment/:commentId')
    @ApiOperation({ summary: 'API for comment like toggle.', description: 'Like or unlike a comment of a post.' })
    @HttpCode(HttpStatus.OK)
    likeComment(@Param('commentId') commentId: number) {
        return this.likeService.toggleCommentLike(commentId);
    }

    @UseGuards(PostAccessGuard)
    @ApiException(() => NotFoundException, { description: 'Post is not found . [key: "postNotFound" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users posts that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => NotFoundException, { description: 'User is not found . [key: "userNotFound" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post that you want to see the accounts that have liked your post.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully viewed the users accounts which liked the post.', type: UserListRes })
    @Get(':postId/getPostLikers')
    @ApiOperation({ summary: 'API for getting the accounts which liked the post.', description: 'API for getting the accounts which liked the post, and also if they are in the current user network , their profile Img and their username.' })
    getPostLikers(@Param('postId') postId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return this.likeService.getPostLikers(postId, postsByPage, page);
    }

    @ApiException(() => NotFoundException, { description: 'Story is not found . [key: "storyNotFound" ]' })
    @ApiParam({ name: 'storyId', description: 'ID of the story that you want to see the accounts that have liked your post.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully viewed the users accounts which liked the post.', type: UserListRes })
    @Get(':storyId/getStoryLikers')
    @ApiOperation({ summary: 'API for getting the accounts which liked the story, in which only the story owner has access.', description: 'API for getting the accounts which liked the story, and also if they are in the current user network , their profile Img and their username.' })
    getStoryLikers(@Param('storyId') storyId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return this.likeService.getStoryLikers(storyId, postsByPage, page);
    }
}
