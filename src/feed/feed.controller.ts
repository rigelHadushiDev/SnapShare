import { Body, Controller, Get, HttpStatus, NotFoundException, Post, Query } from '@nestjs/common';
const path = require('path');
const fs = require('fs');
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetFeedResp } from 'src/post/dtos/getFeed.dto';
import { FeedService } from './feed.service';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';

@ApiBearerAuth()
@ApiTags("User Feed APIs")
@Controller('feed')
export class FeedController {

    constructor(private readonly FeedService: FeedService) { }


    @Get('getPostsFeed')
    @ApiOperation({ summary: 'Retrieve the feed posts and its comments properties' })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiQuery({ name: 'reload', required: false, description: 'NewData in the feed. This is mainly done in the social apss when user just logs in , switching interfaces and when the users want to reload their feed. Once you call the  API updateFeedLastSeen you should add this as a queryPram to true. You will set it as false only when you see that in the post objects you notice even one seenByUser property of post object is set to "true". ', type: Boolean })
    @ApiResponse({ status: HttpStatus.OK, description: " Feed posts got recieved successfully", type: GetFeedResp })
    getPostsFeed(@Query() query: PaginationDto, @Query('postCommentsLimit') postCommentsLimit?: number, @Query('reload') reload?: boolean) {
        const { postsByPage, page } = query;
        return this.FeedService.getPostsFeed(postsByPage, page, postCommentsLimit, reload);
    }

    @Post('updateFeedLastSeen')
    @ApiOperation({ summary: 'Update the Time the user has last seen the feed. This API is related to the reload process of the feed. ', description: 'This API should be called when user just logs in , switching interfaces and when the users want to reload their feed.' })
    @ApiResponse({ status: HttpStatus.OK, description: " Feed posts got reloaded successfully", type: GeneralResponse })
    updateLastSeenTimestamp() {
        return this.FeedService.updateFeedLastSeen();
    }


    @Get('getStoryFeed')
    @ApiOperation({ summary: 'Retrieve the feed stories' })
    // i think the description should change the user doesnt have to call updateFeedLastSeen when calling this api .bc we dont keep track at it by time but woth thw storyViews table, even though pots and stories are togeteher in feed so the fornt end still needs to call it as an API
    @ApiQuery({ name: 'reload', required: false, description: 'NewData in the feed. This is mainly done in the social apss when user just logs in , switching interfaces and when the users want to reload their feed. Once you call the  API updateFeedLastSeen you should add this as a queryPram to true. You will set it as false only when you see that in the post objects you notice even one seenByUser property of post object is set to "true". ', type: Boolean })
    // @ApiResponse({ status: HttpStatus.OK, description: " Story posts got recieved successfully", type: GetFeedResp })
    getStoryFeed(@Query() query: PaginationDto, @Query('reload') reload?: boolean) {
        const { postsByPage, page } = query;
        return this.FeedService.getStoryFeed(postsByPage, page, reload);
        // what cahnges in this case is that you dont need  these two conditions 
        // cond = `AND po."createdAt" >= '${time}'`; and await this.cacheManager.set(`unSeenByUser${this.UserID}`, unSeenByUser); 
        // and lastSeenTimestamp bc you already have a storyViews table to check the actual stories that the user has seen.
        // the algorith is going to stay the same method: 1 . feedAlgorithm 
        // you need fist to prepare the query to get 100 stories of your network with the most nessecary properties 
        // and also 2. getPostsByPriority
    }
}