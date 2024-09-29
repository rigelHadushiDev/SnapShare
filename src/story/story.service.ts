import { BadRequestException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
const fs = require('fs');
import { EntityManager } from 'typeorm';
import { Story } from './story.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import * as path from 'path';
import { GetUserStoriesResDto } from './dtos/GetUserStoriesRes.dto';

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

        let story = new Story();

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

    async getUserStories(postsByPage: number = 10, page: number = 1, userId: number, postCommentsLimit: number = 3) {


        let resp = new GetUserStoriesResDto();

        let offset = (page - 1) * postsByPage;

        let userStoriesQuery = `WITH StoryLikers AS (
            SELECT
                sl."storyId",
                l."username",
                ROW_NUMBER() OVER (PARTITION BY sl."storyId" ORDER BY n."networkId" ASC) AS rn
            FROM "storyLike" sl
            INNER JOIN "user" l ON l."userId" = sl."userId"
            LEFT JOIN "network" n ON n."followeeId" = sl."userId" 
                AND n.pending = FALSE 
                AND n.deleted = FALSE 
                AND n."followerId" = ${this.currUserID}
            LEFT JOIN "story" st ON st."storyId" = sl."storyId" 
                AND st.archive = FALSE
            WHERE sl.deleted = FALSE 
            AND l.archive = FALSE 
            AND st."userId" != sl."userId"
            )
            SELECT 
                so."storyId",
                so."likesNr" AS "storyLikesNr",
                so.media AS "storyMedia",
                so."userId" AS "storyUserId",
                so."createdAt" AS "storyCreatedAt",
                u."profileImg" AS "storyProfileImg",
                CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
                CASE 
                    WHEN sl."likeId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "storyLikedByStoryOwner",
                    CASE 
                    WHEN sv."storyViewsId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "storySeenByCurrentUser",
                STRING_AGG(sls."username", ', ') AS "storyLikersUsernames"
            FROM "story" so
            INNER JOIN "user" u ON u."userId" = so."userId" AND u.archive = FALSE
            LEFT JOIN "storyLike" sl ON sl."storyId" = so."storyId" AND sl."userId" = ${userId} AND sl.deleted = FALSE 
            LEFT JOIN StoryLikers sls ON sls."storyId" = so."storyId" AND sls.rn <= 3
            LEFT JOIN "storyViews" sv ON sv."storyId" = so."storyId" AND sv."userId" = ${this.currUserID}
            WHERE so."userId" = ${userId}
            AND so.archive = FALSE
            AND so."createdAt" >= (CURRENT_TIMESTAMP - INTERVAL '24 hours')
            GROUP BY 
                so."storyId",
                u."profileImg",
                u.username,
                u."firstName",
                u."lastName",
                sl."likeId",
                    sv."storyViewsId"
                    
                    ORDER BY 
                CASE 
                    WHEN sv."storyViewsId" IS NULL THEN 0 -- Unseen stories first
                    ELSE 1 -- Seen stories last
                END,
                so."createdAt" DESC -- Then order by creation date
                LIMIT ${postsByPage}
                OFFSET ${offset};`;

        let stories = await this.entityManager.query(userStoriesQuery)

        let userStoriesContainer = [];
        if (stories?.length !== 0) {
            for (let story of stories) {

                if (story?.storyMedia)
                    story.storyMedia = SnapShareUtility.urlConverter(story.storyMedia);

                if (story?.storyProfileImg)
                    story.storyProfileImg = SnapShareUtility.urlConverter(story.storyProfileImg);

                userStoriesContainer.push(story);
            }
        }
        resp = { userStoriesContainer };
        return resp;
    }



}
