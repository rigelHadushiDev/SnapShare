import { BadRequestException, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { configureStorageOptions, fileStorage, imgVideoFilters } from 'src/user/fileStorage.config';
import { EntityManager } from 'typeorm';
import { StoryService } from './story.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { StoryMediaReq } from './dtos/uploadStory.dto';
import { Story } from './story.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { StoryAcessGuard } from 'src/like/guards/StoryAcess.guard';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetUserStoriesAccessGuard } from './guards/GetUserStoriesAccess.guard';
import { GetUserStoriesResDto } from './dtos/GetUserStoriesRes.dto';

@ApiBearerAuth()
@ApiTags('Story APIs')
@Controller('story')
export class StoryController {

    constructor(private readonly StoryService: StoryService) {
        configureStorageOptions('story', imgVideoFilters);
    }

    @Post('upload')
    @ApiOperation({ summary: "Upload a story.", description: "Upload a story for the current logged-in user. \n The property media is formdata type'multipart/ form - data'  " })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('media', fileStorage))
    @ApiResponse({
        status: HttpStatus.OK, description: 'The story has been successfully uploaded.', type: Story
    })
    @ApiBody({ type: StoryMediaReq, description: 'Story Media upload data', required: true })
    async uploadStory(@UploadedFile() file: Express.Multer.File) {
        return await this.StoryService.uploadStory(file);
    }


    @Delete('delete/:storyId')
    @ApiParam({ name: 'storyId', description: 'Id of the story y ou want to archive' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The story has been successfully deleted.', type: GeneralResponse })
    @ApiException(() => InternalServerErrorException, { description: 'An issue occured on removing this story. [key: "issueDeletingStory" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the story creator can delete the story. [key: "isntStoryCreator" ]' })
    @ApiException(() => NotFoundException, { description: 'Story is not found. [key: "noStoryFound" ]' })
    async deleteStory(@Param('storyId') storyId: number) {
        return await this.StoryService.deleteStory(storyId);
    }

    @UseGuards(GetUserStoriesAccessGuard)
    @Get('getUserStories/:userId')
    @ApiOperation({ summary: 'Get all user stories that were posted in 24 hours.' })
    @ApiParam({ name: 'userId', description: 'ID of the user that owns these stories.' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. You cant see private users stories that are not your friend . [key: "nonFriendPrivateAccList" ]' })
    @ApiException(() => NotFoundException, { description: 'Story is not found . [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'No Story  published by the user was found. [key: "noStoryOnUserAcc" ]' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrived user account stories.', type: GetUserStoriesResDto })
    async getUserStories(@Query() query: PaginationDto, @Param('userId') userId: number) {
        const { postsByPage, page } = query;
        return await this.StoryService.getUserStories(postsByPage, page, userId);
    }


}
