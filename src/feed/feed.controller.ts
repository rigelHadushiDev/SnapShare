import { Body, Controller, Get, HttpStatus, NotFoundException, Query } from '@nestjs/common';
const path = require('path');
const fs = require('fs');
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetFeedResp } from 'src/post/dtos/getFeed.dto';
import { FeedService } from './feed.service';

@ApiBearerAuth()
@ApiTags("User Feed APIs")
@Controller('feed')
export class FeedController {

    constructor(private readonly FeedService: FeedService) { }


    @Get('getPostsFeed')
    @ApiOperation({ summary: 'Retrieve the feed posts and its comments properties' })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: " Feed posts got recieved successfully", type: GetFeedResp })
    @ApiException(() => NotFoundException, { description: 'No Post on Feed was found. [key: "noPostOnFeed" ]' })
    getPostsFeed(@Query() query: PaginationDto, @Query('postCommentsLimit') postCommentsLimit?: number) {
        const { postsByPage, page } = query;
        return this.FeedService.getPostsFeed(postsByPage, page, postCommentsLimit);
    }

    // get Story Feed

}