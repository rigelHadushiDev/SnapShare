import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentPostDto } from './dtos/commentPost.dto';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CommentEditDto } from './dtos/commentEdit.dto';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetCommentRes } from './dtos/getComments.dto';
import { CommentDto } from 'src/post/dtos/getFeed.dto';
import { GetCommentRepliesRes } from './dtos/getCommentReplies.dto';
import { PostAccessGuard } from 'src/like/guards/PostAccess.guard';



@ApiBearerAuth()
@ApiTags("Comment APIs")
@Controller('comment')
export class CommentController {

    constructor(private readonly commentService: CommentService) { }


    @Post()
    @UseGuards(PostAccessGuard)
    @ApiOperation({
        summary: "Add a comment in a post or a reply in post comments.",
        description: " Add a comment to the user post or add replies to a user comment."
    })
    @HttpCode(HttpStatus.OK)
    @ApiBody({ required: true, type: CommentPostDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Comment was successfully added into a post', type: GeneralResponse })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully added a post comment as a new comment or a comment reply. ', type: GeneralResponse })
    @ApiException(() => NotFoundException, { description: 'Post Id where the user wants to comment was not found. [key: "postNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Comment ID of the comment which user wants to reply was not found. [key: "parentCommentNotFound" ]' })
    @ApiBody({ type: CommentPostDto, required: true })
    commentPost(@Body() postData: CommentPostDto) {
        return this.commentService.commentPost(postData);
    }

    @Post('edit')
    @ApiOperation({
        summary: "A comment is sucessfully edited",
        description: "API which serves the purpose of editing a comment, which ofc can be done only by the comment owner."
    })
    @HttpCode(HttpStatus.OK)
    @ApiBody({ type: CommentEditDto, required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'Comment was successfully edited', type: CommentEditDto })
    editPostComment(@Body() postData: CommentEditDto) {
        return this.commentService.editComment(postData);
    }


    @Delete(':commentId')
    @ApiOperation({
        summary: "Delete a post comment",
        description: " The only users allowed to delete a commenat are the owner of the post and the person that created the comment"
    })
    @ApiParam({ name: 'commentId', description: 'Id of the comment that needs to be deleted' })
    @ApiException(() => NotFoundException, { description: 'Post is not found. [key: "postNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Comment with that comment Is is not found. [key: "commentNotFound" ]' })
    @ApiException(() => ForbiddenException, { description: 'This exception is thrown when the user which wants to delete the post in neither the post owner or the comment owner. [key: "cannotDeleteComment" ]' })
    deleteComment(@Param('commentId') commentId: number) {
        return this.commentService.deleteComment(commentId)
    }

    @Get('getComments')
    @ApiOperation({ summary: 'Retrieve the comments of a post' })
    @ApiResponse({ status: HttpStatus.OK, description: " Post comments got recieved successfully", type: [CommentDto] })
    @ApiQuery({ name: 'postId', required: true, description: 'Post Id that you want to recieve comments off.', type: Number })
    getComments(@Query('postId') postId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return this.commentService.getComments(postId, postsByPage, page);
    }


    @Get('getCommentReplies')
    @ApiOperation({ summary: 'Retrieve the replies of a comment' })
    @ApiResponse({
        status: HttpStatus.OK, description: "Replies of a comment got successfully retrived",
        type: [GetCommentRepliesRes]
    })
    @ApiQuery({ name: 'commentId', required: true, description: 'Comment Id that you want to recieve other reply comments off.', type: Number })
    @ApiException(() => ForbiddenException, { description: 'Parent comment Id was not found . [key: "commentIdNotFound" ]' })
    getCommentReplies(@Query('commentId') comentId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return this.commentService.getCommentReplies(comentId, postsByPage, page);
    }
}
