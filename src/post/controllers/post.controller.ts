import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Query, Res, UploadedFile, UseFilters, Post, UseInterceptors, UseGuards, Delete, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
const path = require('path');
import { PostService } from '../services/post.service';
const fs = require('fs');
import { configureStorageOptions, fileStorage, imgVideoFilters } from 'src/user/fileStorage.config';
import { Response } from 'express';
import { EditPostDto } from 'src/post/dtos/editPost.dto'
import { HttpExceptionFilter } from 'src/common/filters/httpException.filter';
import { Observable } from 'rxjs';
import { Post as PostEntity } from '../post.entity';
import { IsCreatorGuard } from '../guards/IsCreator.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostRes, DescriptionDto } from '../dtos/CreatePost.dto';
import { ApiImplicitFormData } from 'src/common/decorators/api-implicit-form-data.decorator';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from '../dtos/GeneralResponse';
import { PostAccessGuard } from 'src/like/guards/PostAccess.guard';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetUserPostsRes } from '../dtos/getUsersPosts.dto';
import { GetUserPostsAccessGuard } from '../guards/GetUserPostsAccess.guard';

@ApiBearerAuth()
@ApiTags("Post APIs")
@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) {
        configureStorageOptions('posts', imgVideoFilters)
    }

    @Post('upload')
    @ApiOperation({ summary: "Create a post.", description: "Create a post for the current logged-in user. \n Both properties are form datas : \n description: application/x-www-form-urlencoded \n  media:  'multipart/ form - data'  " })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('media', fileStorage))
    @ApiImplicitFormData({ name: 'imageData', required: true, type: 'file' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully created.', type: CreatePostRes })
    @ApiException(() => BadRequestException, {
        description: 'A media file is required to create a post. Please upload a media file. [key: "mediaFileRequired" ]'
    })
    async createPost(@UploadedFile() media, @Body() description: DescriptionDto) {
        return await this.PostService.createPost(media, description);
    }


    @UseGuards(IsCreatorGuard)
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found . [key: "postNotFound" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post to be archived' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Successfully toggled archive status. [key: "archiveToggleSuccessful"]', type: GeneralResponse
    })
    @Put('archive/:postId')
    async toggleArchivePost(@Param('postId') postId: number) {
        return await this.PostService.toggleArchivePost(postId);
    }

    @UseGuards(IsCreatorGuard)
    @Delete('delete/:postId')
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found. [key: "postNotFound" ]' })
    @ApiException(() => InternalServerErrorException, { description: 'Issue deleting post. [key: "issueDeletingPost" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post to be deleted' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted the post.', type: GeneralResponse })
    @ApiOperation({ summary: 'Toggle archive status of a post by ID' })
    async deletePost(@Param('postId') postId: number) {
        return await this.PostService.deletePost(postId);
    }


    @UseGuards(IsCreatorGuard)
    @Put('edit/:postId')
    @ApiOperation({ summary: 'Edit a post by ID' })
    @ApiParam({ name: 'postId', description: 'ID of the post that will get edited' })
    @ApiException(() => InternalServerErrorException, { description: 'Issue updating post. [key: "issueUpdatingPost" ]' })
    @ApiException(() => InternalServerErrorException, { description: 'Post description should not be the same with the current description. [key: "newDescriptionShouldBeAdded" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found. [key: "postNotFound" ]' })
    @ApiBody({ type: EditPostDto, description: 'Updated post data', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully edited the post.', type: GeneralResponse })
    async editPost(@Param('postId') postId: number, @Body() postData: EditPostDto) {
        return await this.PostService.editPost(postId, postData);
    }


    @UseGuards(GetUserPostsAccessGuard)
    @Get('getUserPosts/:userId')
    @ApiOperation({ summary: 'Get all posts of an user account.' })
    @ApiParam({ name: 'userId', description: 'ID of the user that owns these posts.' })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users posts that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => NotFoundException, { description: 'Post is not found . [key: "userNotFound" ]' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrived user account posts.', type: GetUserPostsRes })
    async getUserPosts(@Query() query: PaginationDto, @Param('userId') userId: number, @Query('postCommentsLimit') postCommentsLimit?: number) {
        const { postsByPage, page } = query;
        return await this.PostService.getUserPosts(postsByPage, page, userId, postCommentsLimit);
    }

    @UseGuards(PostAccessGuard)
    @Get('getPosyById/:postId')
    @ApiOperation({ summary: 'Get all posts of an user account.' })
    @ApiParam({ name: 'userId', description: 'ID of the user that owns these posts.' })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiException(() => NotFoundException, { description: 'The owner of this post Id was not found . [key: "userNotFound" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users posts that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => ForbiddenException, { description: 'Post Id was not provided or the current loged in user can not be found . [key: "Unauthorized access" ]' })
    @ApiException(() => NotFoundException, { description: 'Post Id was not found . [key: "postNotFound" ]' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrived user account posts.', type: GetUserPostsRes })
    async getPosyById(@Param('postId') postId: number, @Query('postCommentsLimit') postCommentsLimit?: number) {
        return await this.PostService.getPostById(postId, postCommentsLimit);
    }
}