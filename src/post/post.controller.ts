import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
const path = require('path');
import { format } from 'date-fns';
import { PostService } from './post.service';
import { extname } from 'path';
const fs = require('fs');
import { storage } from './fileStorage.config';


@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', storage))
    postFile(@UploadedFile() file, postDescription: any) {
        return this.PostService.postFile(file, postDescription);
    }


}
