import { BadRequestException, Controller, Delete, ForbiddenException, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { configureStorageOptions, fileStorage, imgVideoFilters } from 'src/user/fileStorage.config';
import { EntityManager } from 'typeorm';
import { StoryService } from './story.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { StoryMediaReq } from './UploadStory.dto';
import { Story } from './story.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';

@ApiBearerAuth()
@ApiTags('Story APIs')
@Controller('story')
export class StoryController {

    constructor(private readonly StoryService: StoryService) {
        configureStorageOptions('story', imgVideoFilters);
    }


    @Post('upload')
    @ApiOperation({ summary: "Upload a story.", description: "Upload a story for the current logged-in user. \n The porperty media is formdata type'multipart/ form - data'  " })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('media', fileStorage))
    @ApiResponse({
        status: HttpStatus.OK, description: 'The story has been successfully uploaded.', type: Story
    })
    @ApiBody({ type: StoryMediaReq, description: 'Story Media upload data', required: true })
    uploadStory(@UploadedFile() file: Express.Multer.File) {
        return this.StoryService.uploadStory(file);
    }


    @Delete('delete/:storyId')
    @ApiParam({ name: 'storyId', description: 'Id of the story y ou want to archive' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The story has been successfully deleted.', type: GeneralResponse })
    @ApiException(() => InternalServerErrorException, { description: 'An issue occured on removing this story. [key: "issueDeletingStory" ]' })
    @ApiException(() => ForbiddenException, { description: 'Forbidden. Only the story creator can delete the story. [key: "isntStoryCreator" ]' })
    @ApiException(() => NotFoundException, { description: 'Story is not found. [key: "noStoryFound" ]' })
    deleteStory(@Param('storyId') storyId: number) {
        return this.StoryService.deleteStory(storyId);
    }

}
