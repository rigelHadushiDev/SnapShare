import { BadRequestException, HttpCode, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Post } from 'src/post/post.entity';
import * as path from 'path';
import { Response } from 'express';
import { DescriptionDto } from 'src/post/dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { CommentService } from 'src/comment/comment.service';
import { GetFeedResp } from './dtos/getFeed.dto';
import { StoryViews } from 'src/story/storyViews.entity';
import { UserFeed } from './entities/userFeed.entity';
import { off } from 'process';
import { format } from 'date-fns';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';
import fs from 'fs';
import { StoryFeedDto } from './dtos/getStoriesdto';

@Injectable()
export class FeedService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider,
        private readonly commentService: CommentService, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }


    async getPostsFeed(postsByPage: number = 10, page: number = 1, postCommentsLimit: number = 3, reload: boolean) {


        let resp = new GetFeedResp();

        let offset = (page - 1) * postsByPage;

        let posts = await this.getPostsByPriority(postsByPage, offset, reload);

        let feedContainer = [];


        for (let post of posts) {
            let postContainer = [];

            if (post?.postMedia)
                post.postMedia = SnapShareUtility.urlConverter(post.postMedia);

            if (post?.postProfileImg)
                post.postProfileImg = SnapShareUtility.urlConverter(post.postProfileImg);

            const comment = await this.commentService.getComments(post.postId, postCommentsLimit);

            postContainer.push(post, comment)
            feedContainer.push(postContainer);
        }


        resp = { feedContainer };
        return resp;
    }

    async getPostsByPriority(postsByPage: number, offset: number = 0, reload: boolean) {

        let resp: any[] = [];

        let standartLimit: number = 200;
        let cond: string = '';
        let unSeenByUser: boolean = true;
        let limit: number;

        let result: any[] = [];

        let lastSeenTimestamp = await this.entityManager
            .createQueryBuilder(UserFeed, 'uf')
            .select('uf.lastSeenTimestamp', 'timestamp')
            .where('uf.userId = :userId', { userId: this.UserID })
            .getRawOne();

        let time: string;
        if (lastSeenTimestamp)
            time = format(new Date(lastSeenTimestamp.timestamp), "yyyy-MM-dd HH:mm:ss");

        if (reload) {
            if (lastSeenTimestamp) {

                cond = `AND po."createdAt" >= '${time}'`;

                let getDataForAlgOffset: number = 0;
                if (standartLimit === offset) {
                    // if the batch gets used get a new batch and change correspondingly the offset and limit
                    getDataForAlgOffset = standartLimit;
                    standartLimit = standartLimit * 2;
                }

                // reset the offset of the data taken from the sorting algorithm once the new batch of data is taken
                offset = offset - getDataForAlgOffset;

                result = await this.getPostsToFeedAlgorithm(cond, unSeenByUser, standartLimit, getDataForAlgOffset);
                let topNewPosts = await this.feedPostsAlgorithm(result, postsByPage, offset);

                await this.cacheManager.set(`unSeenByUser${this.UserID}`, unSeenByUser);

                if (topNewPosts?.length > 0 && topNewPosts) {
                    resp.push(topNewPosts);
                }

                if (topNewPosts?.length < postsByPage) {

                    unSeenByUser = false;
                    await this.cacheManager.set(`unSeenByUser${this.UserID}`, unSeenByUser);

                    // take the ones that are older
                    cond = `AND po."createdAt" < '${time}'`;

                    // this will happpen only once
                    result = await this.getPostsToFeedAlgorithm(cond, unSeenByUser, standartLimit);

                    offset = 0

                    limit = postsByPage - topNewPosts?.length;

                    let topOldPosts = await this.feedPostsAlgorithm(result, limit, offset);
                    resp.push(topOldPosts);

                }

            } else {

                // this will also happen only once because it will directly send the seenByUser to true and the newDate will be false
                unSeenByUser = false;
                await this.cacheManager.set(`unSeenByUser${this.UserID}`, unSeenByUser);

                // cond will be set to empty string bc its the first time ever user opens their feed
                cond = '';

                result = await this.getPostsToFeedAlgorithm(cond, unSeenByUser, standartLimit);
                let oldPostsOrder = await this.feedPostsAlgorithm(result, postsByPage, offset);
                resp.push(oldPostsOrder);
            }
            resp = resp.flat();
            let postIds = resp.map(post => post.postId).join(', ');
            await this.cacheManager.set(`oldPostID${this.UserID}`, postIds);

        } else {
            // not IN and the postID to the method getPostsToFeedAlgorithm

            unSeenByUser = false;
            await this.cacheManager.set(`unSeenByUser${this.UserID}`, unSeenByUser);

            let getDataForAlgOffset: number = 0;
            if (standartLimit === offset) {
                getDataForAlgOffset = standartLimit;
                standartLimit = standartLimit * 2;
            }

            offset = offset - getDataForAlgOffset;

            let oldPostIds = await this.cacheManager.get(`oldPostID${this.UserID}`);
            let previousOffset: number = await this.cacheManager.get(`previousOffset${this.UserID}`);

            if (previousOffset >= offset || offset == 0) {
                if (time && oldPostIds)
                    cond = ` AND (po."postId" IN (${oldPostIds}) OR po."createdAt" < '${time}')`;
            } else {
                cond = ` AND (po."postId" NOT IN (${oldPostIds}) AND po."createdAt" < '${time}') `;
                offset = offset - postsByPage;
            }


            result = await this.getPostsToFeedAlgorithm(cond, unSeenByUser, standartLimit, getDataForAlgOffset);
            let oldPostsOrder = await this.feedPostsAlgorithm(result, postsByPage, offset);
            resp.push(oldPostsOrder);
            resp = resp.flat();
        }

        await this.cacheManager.set(`previousOffset${this.UserID}`, offset);
        return resp;
    }


    async getPostsToFeedAlgorithm(cond: string = '', unSeenByUser: boolean, limit: any, offset: any = 0) {

        offset = offset ? ` OFFSET ${offset}` : '';
        limit = limit ? ` LIMIT ${limit}` : '';

        let feedPostsQuery = `
        WITH PostLikers AS (
            SELECT
                pl."postId",
                l."username",
                ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY n."networkId" ASC) AS rn
            FROM "postLike" pl
            INNER JOIN "user" l ON l."userId" = pl."userId"
            LEFT JOIN "network" n ON n."followeeId" = l."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.UserID} 
            WHERE pl.deleted = FALSE AND l."userId" <> ${this.UserID} 
        ),
        EngagementComment AS (
            SELECT 
                LEAST(CAST(${this.UserID} AS INTEGER), po."userId") AS "userId1", 
                GREATEST(CAST(${this.UserID} AS INTEGER), po."userId") AS "userId${this.UserID}", 
                e."engagementNr" AS "engagementCommentNr"
            FROM "engagement" e
            INNER JOIN "post" po ON LEAST(CAST(${this.UserID} AS INTEGER), po."userId") = e."userId1"
            AND GREATEST(CAST(${this.UserID} AS INTEGER), po."userId") = e."userId${this.UserID}"
            WHERE e."engagementTypeId" = (
                SELECT "engagementTypeId" FROM "engagementType" WHERE "type" = 'COMMENT'
            )
        ),
        EngagementLike AS (
            SELECT 
                LEAST(CAST(${this.UserID} AS INTEGER), po."userId") AS "userId1", 
                GREATEST(CAST(${this.UserID} AS INTEGER), po."userId") AS "userId${this.UserID}", 
                e."engagementNr" AS "engagementLikeNr"
            FROM "engagement" e
            INNER JOIN "post" po ON LEAST(CAST(${this.UserID} AS INTEGER), po."userId") = e."userId1"
            AND GREATEST(CAST(${this.UserID} AS INTEGER), po."userId") = e."userId${this.UserID}"
            WHERE e."engagementTypeId" = (
                SELECT "engagementTypeId" FROM "engagementType" WHERE "type" = 'LIKE'
            )
        )
        SELECT
            po."postId" ,
            po."postDescription",
            po."commentsNr" AS "postCommentsNr",
            po."likesNr" as "postLikesNr",
            po.media as "postMedia",
            po."userId" as "postUserId",
            po."createdAt" as "postCreatedAt",
            u."profileImg" as "postProfileImg",
            u.username as "postLikersUsername",
            CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
            CASE
                WHEN pl."likeId" IS NOT NULL THEN 'true'
                ELSE 'false'
            END AS "postLikedByUser",
            STRING_AGG(pls."username", ', ') AS "postLikersUsernames",
            '${unSeenByUser}' as "unSeenByUser",
            COALESCE(ec."engagementCommentNr", 0) AS "engagementCommentNr",
            COALESCE(el."engagementLikeNr", 0) AS "engagementLikeNr"
        FROM "post" po
        INNER JOIN "user" u ON u."userId" = po."userId" AND u.archive = false
        LEFT JOIN "network" n ON n."followeeId" = po."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.UserID} 
        LEFT JOIN "postLike" pl ON pl."userId" = n."followerId" AND pl."postId" = po."postId" AND pl.deleted = false
        LEFT JOIN PostLikers pls ON pls."postId" = po."postId" AND pls.rn <= 3
        LEFT JOIN EngagementComment ec ON ec."userId1" = LEAST(${this.UserID} , po."userId") AND ec."userId${this.UserID}" = GREATEST(${this.UserID} , po."userId")
        LEFT JOIN EngagementLike el ON el."userId1" = LEAST(${this.UserID} , po."userId") AND el."userId${this.UserID}" = GREATEST(${this.UserID} , po."userId")
        WHERE po.archive = FALSE AND n."networkId" IS NOT NULL ${cond}
        GROUP BY
            po."postId",
            u."profileImg",
            u.username,
            u."firstName",
            u."lastName",
            pl."likeId",
            ec."engagementCommentNr",
            el."engagementLikeNr"
        ORDER BY po."createdAt" DESC
       ${limit}
       ${offset}`;

        let resp = await this.entityManager.query(feedPostsQuery);
        return resp;
    }

    async feedPostsAlgorithm(posts, postsByPage: number, offset: number = 0) {

        let resp: any;
        const rankedPosts: any[] = [];

        for (const post of posts) {

            const score = (
                (post.postCreatedAt * 0.40) +
                (post.engagementCommentNr * 0.25) +
                (post.engagementLikeNr * 0.12) +
                (post.postCommentsNr * 0.13) +
                (post.postLikesNr * 0.10)
            );

            rankedPosts.push({ post, score });
        }

        // Step 5: Sort the rankedPosts list by score in descending order
        const sortedPosts = rankedPosts.sort((a, b) => b.score - a.score);

        // Step 6: Extract the top posts withmost points. The number of posts theat should be send it is set by the value of variable postsByPage
        const topPosts = sortedPosts.slice(offset, offset + postsByPage);

        // Step 7: Return the top posts
        resp = topPosts.map(rankedPost => rankedPost.post);

        return resp;
    }

    async updateFeedLastSeen(): Promise<GeneralResponse> {
        let resp = new GeneralResponse();
        try {
            await this.entityManager
                .createQueryBuilder()
                .insert()
                .into(UserFeed)
                .values({
                    userId: this.UserID,
                    lastSeenTimestamp: new Date(), // Use the current date and time
                })
                .orUpdate(['lastSeenTimestamp'], ['userId'])
                .execute();

            resp = { status: HttpStatus.OK, message: 'updateFeedLastSeen' }
        } catch (error) {
            throw new InternalServerErrorException('failedUpdateingFeedLastSeen');
        }
        return resp;
    }

    // stories feed

    async getStoriesByPriority(postsByPage: number, offset: number = 0, reload: boolean) {


        let resp: any[] = [];

        let standartLimit: number = 200;
        let cond: string = ` AND sv."storyViewsId" IS NULL `
        let limit: number;

        let result: any[] = [];

        let lastSeenTimestamp = await this.entityManager
            .createQueryBuilder(UserFeed, 'uf')
            .select('uf.lastSeenTimestamp', 'timestamp')
            .where('uf.userId = :userId', { userId: this.UserID })
            .getRawOne();


        let time: string;
        if (lastSeenTimestamp)
            time = format(new Date(lastSeenTimestamp.timestamp), "yyyy-MM-dd HH:mm:ss");

        if (reload) {

            if (lastSeenTimestamp) {

                cond += ` AND st."createdAt" >= '${time}' `;

                let getDataForAlgOffset: number = 0;
                if (standartLimit === offset) {
                    // if the batch gets used get a new batch and change correspondingly the offset and limit
                    getDataForAlgOffset = standartLimit;
                    standartLimit = standartLimit * 2;
                }

                // reset the offset of the data taken from the sorting algorithm once the new batch of data is taken
                offset = offset - getDataForAlgOffset;

                result = await this.getStoriesToFeedAlgorithm(cond, standartLimit, getDataForAlgOffset);

                let topNewStories = await this.feedStoriesAlgorithm(result, postsByPage, offset);

                if (topNewStories?.length > 0 && topNewStories)
                    resp.push(topNewStories);


                if (topNewStories?.length < postsByPage) {

                    // take the ones that are older
                    cond = ` AND sv."storyViewsId" IS NULL AND st."createdAt" < '${time}'  `;

                    // this will happpen only once
                    result = await this.getStoriesToFeedAlgorithm(cond, standartLimit);

                    offset = 0
                    limit = postsByPage - topNewStories?.length;

                    let topOldPosts = await this.feedStoriesAlgorithm(result, limit, offset);

                    if (topOldPosts?.length > 0 && topOldPosts)
                        resp.push(topOldPosts);

                    if (topOldPosts?.length < limit) {
                        cond = ` AND sv."storyViewsId" IS NOT NULL AND st."createdAt" < '${time}'  `;

                        // this will happpen only once
                        result = await this.getStoriesToFeedAlgorithm(cond, standartLimit);
                        limit = limit - topOldPosts?.length;
                        topOldPosts = await this.feedStoriesAlgorithm(result, limit, offset);
                        if (topOldPosts?.length > 0 && topOldPosts)
                            resp.push(topOldPosts);
                    }

                }

            } else {
                cond = ``;
                // its the first time ever user opens their feed
                result = await this.getStoriesToFeedAlgorithm(cond);
                let oldStoriesOrder = await this.feedStoriesAlgorithm(result, postsByPage, offset);
                resp.push(oldStoriesOrder);
            }
            resp = resp.flat();
            let storyIds = resp.map(story => story.storyId).join(', ');
            await this.cacheManager.set(`oldStoryID${this.UserID}`, storyIds);

        } else {

            let getDataForAlgOffset: number = 0;
            if (standartLimit === offset) {
                getDataForAlgOffset = standartLimit;
                standartLimit = standartLimit * 2;
            }

            offset = offset - getDataForAlgOffset;

            let oldStoryIds = await this.cacheManager.get(`oldStoryID${this.UserID}`);
            let previousOffset: number = await this.cacheManager.get(`previousStoryOffset${this.UserID}`);

            if (previousOffset >= offset || offset == 0) {
                cond = ` AND (st."storyId" IN (${oldStoryIds}) OR st."createdAt" < '${time}')`;
            } else {
                cond = ` AND (st."storyId" NOT IN (${oldStoryIds}) AND st."createdAt" < '${time}') `;
                offset = offset - postsByPage;
            }


            result = await this.getStoriesToFeedAlgorithm(cond, standartLimit, getDataForAlgOffset);
            let oldStoriesOrder = await this.feedStoriesAlgorithm(result, postsByPage, offset);
            resp.push(oldStoriesOrder);
            resp = resp.flat();
        }

        await this.cacheManager.set(`previousStoryOffset${this.UserID}`, offset);
        return resp;
    }


    async getStoriesToFeedAlgorithm(seenCond: boolean | string = false, limit?: number | string, offset?: number | string) {

        offset = offset ? ` OFFSET ${offset}` : '';
        limit = limit ? ` LIMIT ${limit}` : '';

        let feedStoriesQuery: string = `WITH StoryLikers AS (
    SELECT
        sl."storyId",
        l."username",
        ROW_NUMBER() OVER (PARTITION BY sl."storyId" ORDER BY n."networkId" ASC) AS rn
    FROM "storyLike" sl
    INNER JOIN "user" l ON l."userId" = sl."userId"
    LEFT JOIN "network" n ON n."followeeId" = l."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.UserID}
    WHERE sl.deleted = FALSE AND l."userId" <> ${this.UserID}
),
EngagementComment AS (
    SELECT
        LEAST(CAST(${this.UserID} AS INTEGER), sl."userId") AS "userId1",
        GREATEST(CAST(${this.UserID} AS INTEGER), sl."userId") AS "userId2",
        e."engagementNr" AS "engagementCommentNr"
    FROM "engagement" e
    INNER JOIN "story" sl ON LEAST(CAST(${this.UserID} AS INTEGER), sl."userId") = e."userId1"
    AND GREATEST(CAST(${this.UserID} AS INTEGER), sl."userId") = e."userId2"
    WHERE e."engagementTypeId" = (
        SELECT "engagementTypeId" FROM "engagementType" WHERE "type" = 'COMMENT'
    )
),
EngagementLike AS (
    SELECT
        LEAST(CAST(${this.UserID} AS INTEGER), sl."userId") AS "userId1",
        GREATEST(CAST(${this.UserID} AS INTEGER), sl."userId") AS "userId2",
        e."engagementNr" AS "engagementLikeNr"
    FROM "engagement" e
    INNER JOIN "story" sl ON LEAST(CAST(${this.UserID} AS INTEGER), sl."userId") = e."userId1"
    AND GREATEST(CAST(${this.UserID} AS INTEGER), sl."userId") = e."userId2"
    WHERE e."engagementTypeId" = (
        SELECT "engagementTypeId" FROM "engagementType" WHERE "type" = 'LIKE'
    )
)
SELECT 
    st."storyId",
    st."likesNr" AS "storyLikesNr",
    st.media AS "storyMedia",
    st."userId" AS "storytUserId",
    st."createdAt" AS "storyCreatedAt",
    u."profileImg" AS "storyProfileImg",
    u.username AS "storyOwnerUsername",
    CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
    CASE
        WHEN sl."likeId" IS NOT NULL THEN 'true'
        ELSE 'false'
    END AS "storyLikedByUser",
    STRING_AGG(sls."username", ', ') AS "storyLikersUsernames",
    COALESCE(ec."engagementCommentNr", 0) AS "engagementCommentNr",
    COALESCE(el."engagementLikeNr", 0) AS "engagementLikeNr",
    CASE
        WHEN sv."storyViewsId" IS NOT NULL THEN 'true'
        ELSE 'false'
    END AS "seenByUser"
FROM "story" st
INNER JOIN "user" u ON u."userId" = st."userId" AND u.archive = false
LEFT JOIN "network" n ON n."followeeId" = st."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.UserID}
LEFT JOIN "storyLike" sl ON sl."userId" = n."followerId" AND sl."storyId" = st."storyId" AND sl.deleted = false
LEFT JOIN StoryLikers sls ON sls."storyId" = st."storyId" AND sls.rn <= 3
LEFT JOIN EngagementComment ec ON ec."userId1" = LEAST(${this.UserID} , st."userId") AND ec."userId2" = GREATEST(${this.UserID} , st."userId")
LEFT JOIN EngagementLike el ON el."userId1" = LEAST(${this.UserID} , st."userId") AND el."userId2" = GREATEST(${this.UserID} , st."userId")
LEFT JOIN "storyViews" sv ON sv."storyId" = st."storyId" AND sv."userId" = ${this.UserID}
WHERE st.archive = FALSE
  AND n."networkId" IS NOT NULL  
	${seenCond}
GROUP BY
    st."storyId",
    u."profileImg",
    u.username,
    u."firstName",
    u."lastName",
    sl."likeId",
    ec."engagementCommentNr",
    el."engagementLikeNr",
    sv."storyViewsId"
ORDER BY 
    CASE
        WHEN sv."storyViewsId" IS NULL THEN 0  -- Unseen stories first
        ELSE 1  -- Seen stories second
    END,
    st."createdAt" DESC
    ${limit}
    ${offset}`;

        let resp = await this.entityManager.query(feedStoriesQuery);
        return resp;

    }


    async getStoryFeed(postsByPage: number = 10, page: number = 1, reload: boolean) {


        let resp: StoryFeedDto[] = [];

        let offset = (page - 1) * postsByPage;

        let stories = await this.getStoriesByPriority(postsByPage, offset, reload);

        let storyfeedContainer = [];

        for (let story of stories) {

            if (story?.storyMedia)
                story.storyMedia = SnapShareUtility.urlConverter(story.storyMedia);

            if (story?.storyProfileImg)
                story.storyProfileImg = SnapShareUtility.urlConverter(story.storyProfileImg);

            storyfeedContainer.push(story)
        }

        resp = storyfeedContainer;
        return storyfeedContainer;
    }

    async feedStoriesAlgorithm(stories, postsByPage: number, offset: number = 0) {


        let resp: any;
        const rankedStories: any[] = [];
        for (const story of stories) {

            const score = (
                (story.engagementCommentNr * 0.5) +
                (story.engagementLikeNr * 0.25) +
                (story.postCommentsNr * 0.16) +
                (story.postLikesNr * 0.9)
            );

            rankedStories.push({ story, score });
        }

        // Step 5: Sort the rankedPosts list by score in descending order
        const sortedStories = rankedStories.sort((a, b) => b.score - a.score);

        // Step 6: Extract the top posts withmost points. The number of posts theat should be send it is set by the value of variable postsByPage
        const topStories = sortedStories.slice(offset, offset + postsByPage);

        // Step 7: Return the top posts
        resp = topStories.map(rankedStories => rankedStories.story);

        return resp;
    }
}