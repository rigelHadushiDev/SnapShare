import { Body, Controller, Delete, ForbiddenException, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentPostDto } from './commentPost.dto';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { CommentEditDto } from './commentEdit.dto';



@ApiBearerAuth()
@ApiTags("Comment APIs")
@Controller('comment')
export class CommentController {

    constructor(private readonly commentService: CommentService) { }


    @Post()
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


    // here you should a method which gets comments with pagination with certain charchteristics
    // if a user has comment it should be first
    // comments with more likes should be first 
    // if user has replied in one of the comments it should be one of the first
    // dont forget user profile Img should be convert in a url

}
