import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { configureStorageOptions, imgVideoFilters } from 'src/user/fileStorage.config';
import { EntityManager } from 'typeorm';
import { StoryService } from './story.service';

@ApiBearerAuth()
@ApiTags('Story APIs')
@Controller('story')
export class StoryController {

    constructor(private readonly EntityManger: EntityManager, private readonly StoryService: StoryService) {
        configureStorageOptions('storys', imgVideoFilters);
    }


    @Post('upload')
    async uploadStory() {
        // return await this.StoryService.uploadStory();
    }


    //toggleArchieve


    //delete



}
