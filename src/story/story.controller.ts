import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { configureStorageOptions, fileStorage, imgVideoFilters } from 'src/user/fileStorage.config';
import { EntityManager } from 'typeorm';
import { StoryService } from './story.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { StoryMediaReq } from './UploadStory.dto';

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
        status: HttpStatus.OK, description: 'The story has been successfully uploaded.', //type:
    })
    @ApiBody({ type: StoryMediaReq, description: 'Story Media upload data', required: true })
    @ApiException(() => BadRequestException, {
        description: 'A  media file is required to create a story. Please upload a media file. [key: "pleaseUploadStoryData" ]'
    })
    async uploadStory(@UploadedFile() file: Express.Multer.File) {
        return await this.StoryService.uploadStory(file);
    }


    //toggleArchieve


    //delete


}
