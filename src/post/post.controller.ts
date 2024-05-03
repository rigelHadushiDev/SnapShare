import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
const path = require('path');
import { PostService } from './post.service';
const fs = require('fs');
import { storage } from './fileStorage.config';
import { Response } from 'express';



@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', storage))
    postFile(@UploadedFile() file, @Body() postData: string) {
        return this.PostService.postFile(file, postData);
    }


    @Get('getUserPosts')
    getUserPosts() {
        return this.PostService.getUserPosts();
    }


    @Get('display/:userId/:filename')
    getUserMedia(@Param('userId') userId: string, @Param('filename') filename: string, @Res() res: Response) {
        return this.PostService.getUserMedia(userId, filename, res);
    }


}