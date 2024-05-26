import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, Query, Res, UploadedFile, UseFilters, UseInterceptors, Post, UseGuards, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
const path = require('path');
import { PostService } from './post.service';
const fs = require('fs');
import { postStorage } from './fileStorage.config';
import { Response } from 'express';
import { EditPostDto } from './dtos/editPost.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { Observable } from 'rxjs';
import { Post as PostEntity } from './post.entity';
import { IsCreatorGuard } from './guards/IsCreator.guard';


@UseFilters(HttpExceptionFilter)
@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', postStorage))
    postFile(@UploadedFile() file, @Body() postData: string) {
        return this.PostService.postFile(file, postData);
    }

    @Get('getUserPosts')
    getUserPosts(@Query('take') take: number = 1, @Query('skip') skip: number = 1) {
        take = take > 20 ? 20 : take;
        return this.PostService.getUserPosts(take, skip);
    }

    @Get('display/:type/:userName/:filename')
    getUserMedia(@Param('userName') userName: string, @Param('type') type: string, @Param('filename') filename: string, @Res() res: Response) {
        return this.PostService.getUserMedia(userName, type, filename, res);
    }

    @Put('archive/:postId')
    archivePost(@Param('postId') postId: number) {
        return this.PostService.archivePost(postId);
    }

    @UseGuards(IsCreatorGuard)
    @Delete('delete/:postId')
    deletePost(@Param('postId') postId: number) {
        return this.PostService.deletePost(postId);
    }

    @Put('edit/:postId')
    editPost(@Param('postId') postId: number, @Body() postData: EditPostDto) {
        return this.PostService.editPost(postId, postData);
    }

    @Get(':postId')
    getPostById(@Param('postId') postId: number) {
        return this.PostService.findPostById(postId);
    }


}