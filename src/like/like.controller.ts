import { Controller, ForbiddenException, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { PostAccessGuard } from './guards/PostAccess.guard';
import { StoryAcessGuard } from './guards/StoryAcess.guard';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';


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
    @HttpCode(HttpStatus.OK)
    likeComment(@Param('commentId') commentId: number) {
        return this.likeService.toggleCommentLike(commentId);
    }

}
