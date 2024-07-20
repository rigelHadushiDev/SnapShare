import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Query, Res, UploadedFile, UseFilters, Post, UseInterceptors, UseGuards, Delete, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
const path = require('path');
import { PostService } from '../services/post.service';
const fs = require('fs');
import { configureStorageOptions, fileStorage, imgVideoFilters } from 'src/user/fileStorage.config';
import { Response } from 'express';
import { EditPostDto } from '../dtos/EditPost.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { Observable } from 'rxjs';
import { Post as PostEntity } from '../post.entity';
import { IsCreatorGuard } from '../guards/IsCreator.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostRes, DescriptionDto } from '../dtos/CreatePost.dto';
import { ApiImplicitFormData } from 'src/common/decorators/api-implicit-form-data.decorator';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from '../dtos/GeneralResponse';


@ApiBearerAuth()
@ApiTags("Post APIs")
@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }


    @UseGuards(IsCreatorGuard)
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => ForbiddenException, { description: 'Post is not found . [key: "postNotFound" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post to be archived' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Successfully toggled archive status. [key: "archiveToggleSuccessful"]', type: GeneralResponse
    })
    @Put('archive/:postId')
    toggleArchivePost(@Param('postId') postId: number) {
        return this.PostService.toggleArchivePost(postId);
    }

    @UseGuards(IsCreatorGuard)
    @Delete('delete/:postId')
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => ForbiddenException, { description: 'Post is not found. [key: "postNotFound" ]' })
    @ApiException(() => InternalServerErrorException, { description: 'Issue deleting post. [key: "issueDeletingPost" ]' })
    @ApiParam({ name: 'postId', description: 'ID of the post to be deleted' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully deleted the post.', type: GeneralResponse })
    @ApiOperation({ summary: 'Toggle archive status of a post by ID' })
    deletePost(@Param('postId') postId: number) {
        return this.PostService.deletePost(postId);
    }


    @UseGuards(IsCreatorGuard)
    @Put('edit/:postId')
    @ApiOperation({ summary: 'Edit a post by ID' })
    @ApiParam({ name: 'postId', description: 'ID of the post that will get edited' })
    @ApiException(() => InternalServerErrorException, { description: 'Issue updating post. [key: "issueUpdatingPost" ]' })
    @ApiException(() => InternalServerErrorException, { description: 'Post description should not be the same with the current description. [key: "newDescriptionShouldBeAdded" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the post creator can archive the post. [key: "forbiddenResource" ]' })
    @ApiException(() => ForbiddenException, { description: 'Post is not found. [key: "postNotFound" ]' })
    @ApiBody({ type: EditPostDto, description: 'Updated post data', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully edited the post.', type: GeneralResponse })
    editPost(@Param('postId') postId: number, @Body() postData: EditPostDto) {
        return this.PostService.editPost(postId, postData);
    }



    @Get(':postId')
    @ApiOperation({ summary: 'Retrieve a post by ID' })
    @ApiParam({ name: 'postId', description: 'ID of the post that want to be retrieved' })
    @ApiException(() => ForbiddenException, { description: 'Post is not found. [ key: "postNotFound" ]' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully found a post', type: PostEntity })
    getPostById(@Param('postId') postId: number) {
        return this.PostService.findPostById(postId);
    }
}