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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostRes, DescriptionDto } from '../dtos/CreatePost.dto';
import { ApiImplicitFormData } from 'src/common/decorators/api-implicit-form-data.decorator';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from '../dtos/GeneralResponse';
import { ContentMediaService } from '../services/contentMedia.service';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetFeedResp } from '../dtos/getFeed.dto';

@ApiBearerAuth()
@ApiTags("Content Media APIs")
@Controller('contentMedia')
export class ContentMediaController {

    constructor(private readonly ContentMediaService: ContentMediaService) { }




    @Get('display/:type/:userName/:filename')
    @ApiOperation({ summary: 'Retrieve a media file by type, username, and filename' })
    @ApiParam({ name: 'type', description: 'The type of media (e.g., image, video)' })
    @ApiParam({ name: 'userName', description: 'The hashed username of the media owner' })
    @ApiParam({ name: 'filename', description: 'The filename of the media' })
    @ApiResponse({
        status: HttpStatus.OK, description: 'The media file has been successfully retrieved.', content: { 'application/octet-stream': {} }
    })
    getMedia(@Param('userName') userName: string, @Param('type') type: string, @Param('filename') filename: string, @Res() res: Response) {
        return this.ContentMediaService.getMedia(userName, type, filename, res);
    }

    @Get('getFeed')
    @ApiOperation({ summary: 'Retrieve the feed posts and its comments properties' })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: " Feed posts got recieved successfully", type: GetFeedResp })
    @ApiException(() => NotFoundException, { description: 'No Post on Feed was found. [key: "noPostOnFeed" ]' })
    getFeed(@Query() query: PaginationDto, @Query('postCommentsLimit') postCommentsLimit?: number) {
        const { postsByPage, page } = query;
        return this.ContentMediaService.getFeed(postsByPage, page, postCommentsLimit);
    }

}