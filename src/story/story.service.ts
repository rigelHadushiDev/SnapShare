import { BadRequestException, Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { User } from 'src/user/user.entity';
import { EntityManager } from 'typeorm';
import { Story } from './story.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';

@Injectable()
export class StoryService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }



    async uploadStory(file: Express.Multer.File) {

        let resp: any;

        const userId: number = this.currUserID;

        if (!file)
            throw new BadRequestException('pleaseUploadStoryData');

        const filePath: string = file.path;

        let story = new Story;

        await this.entityManager.transaction(async transactionalEntityManager => {

            story.userId = userId;
            story.media = filePath;

            await transactionalEntityManager.save(Story, story);
        });

        if (story && story?.media) {
            story.media = SnapShareUtility.urlConverter(story.media);
        }

        resp = story;

        return resp;

    };










}
