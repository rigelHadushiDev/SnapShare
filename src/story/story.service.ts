import { BadRequestException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
const fs = require('fs');
import { EntityManager } from 'typeorm';
import { Story } from './story.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import * as path from 'path';

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

        const filePath: string = file.path;

        let story = new Story;

        await this.entityManager.transaction(async transactionalEntityManager => {

            story.userId = userId;
            story.media = filePath;

            story = await transactionalEntityManager.save(Story, story);
        });

        if (story && story?.media) {
            story.media = SnapShareUtility.urlConverter(story.media, story.storyId);
        }

        resp = story;

        return resp;

    };


    async deleteStory(storyId: number): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId = this.currUserID;

        const story = await this.entityManager
            .createQueryBuilder(Story, 'story')
            .select('*')
            .where('story.storyId = :storyId', { storyId })
            .getRawOne();

        if (!story)
            throw new NotFoundException('noStoryFound');
        else if (story?.userId != userId)
            throw new ForbiddenException('isntStoryCreator');

        if (story?.media) {
            const filePath = path.resolve(story.media);
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new InternalServerErrorException("issueDeletingStory");
                }
            });
        }

        const deleteQuery = await this.entityManager
            .createQueryBuilder()
            .delete()
            .from(Story)
            .where('storyId = :storyId', { storyId })
            .execute();

        if (deleteQuery.affected === 1 && story.media)
            resp = { message: 'postSuccessfullyDeleted', status: HttpStatus.OK };
        else
            resp = { message: 'postIsAlreadyDeleted', status: HttpStatus.OK };

        return resp;
    }

    async findStoryById(storyId: number): Promise<Story> {

        const story = await this.entityManager.findOne(Story, { where: { storyId: storyId } })

        if (!story) {
            throw new NotFoundException(`storyNotFound`);
        }

        return story;
    }





}
