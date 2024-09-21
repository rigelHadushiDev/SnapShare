import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Post } from 'src/post/post.entity';
import * as path from 'path';
import { Response } from 'express';
import { DescriptionDto } from 'src/post/dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { CommentService } from 'src/comment/comment.service';
import { GetFeedResp } from 'src/post/dtos/getFeed.dto';
import { StoryViews } from 'src/story/StoryViews.entity';
import { UserFeed } from './entities/userFeed.entity';
import { off } from 'process';
const fs = require('fs');

@Injectable()
export class FeedService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider,
        private readonly commentService: CommentService
    ) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }

    async getMedia(hashedUser: string, type: string, filename: string, mediaId: number = 0, res: Response) {

        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;

        if (type === 'story') {

            if (!mediaId) {
                throw new InternalServerErrorException('issueInOpeningTheFile')
            }

            const existingRecord = await this.entityManager.createQueryBuilder(StoryViews, 'storyViews')
                .where('storyViews.userId = :userId', { userId: this.UserID })
                .andWhere('storyViews.storyId = :storyId', { storyId: mediaId })
                .getOne();

            if (!existingRecord) {
                await this.entityManager.createQueryBuilder()
                    .insert()
                    .into(StoryViews)
                    .values({
                        user: { userId: this.UserID },
                        story: { storyId: mediaId }
                    })
                    .execute();
            }
        }

        res.sendFile(filePath);
    }


    async getPostsFeed(postsByPage: number = 10, page: number = 1, postCommentsLimit: number = 3) {


        let resp = new GetFeedResp();

        let offset = (page - 1) * postsByPage;
        let posts = await this.getPostsByPriority(postsByPage, offset);

        let feedContainer = [];
        for (let post of posts) {
            let postContainer = [];

            if (post?.postMedia)
                post.postMedia = SnapShareUtility.urlConverter(post.postMedia);

            if (post?.postProfileImg)
                post.postProfileImg = SnapShareUtility.urlConverter(post.postProfileImg);

            let comment = await this.commentService.getComments(post.postId, postCommentsLimit)

            postContainer.push(post, comment)
            feedContainer.push(postContainer);
        }

        resp = { feedContainer };
        return resp;
    }



    async getPostsByPriority(postsByPage: number, offset: number = 0) {

        let resp: any;
        let standartLimit: number = 100;
        let cond: string = '';
        let seenByUser: boolean = false;
        let limit: number;

        let result: any[] = [];

        const lastSeenTimestamp = await this.entityManager
            .createQueryBuilder(UserFeed, 'uf')
            .select('uf.lastSeenTimestamp', 'lastSeenTimestamp')
            .where('uf.userId = :userId', { userId: this.UserID })
            .getRawOne();

        if (offset === 0) {
            if (lastSeenTimestamp) {
                cond = `AND po."createdAt" >= '${lastSeenTimestamp}'`;
                limit = standartLimit;

                result = await this.getDataToFeedAlgorithm(cond, seenByUser, limit);
                resp = await this.feedAlgorithm(cond, postsByPage);

                if (resp?.length < postsByPage) {

                    cond = ` AND po."createdAt" < '${lastSeenTimestamp}'`;
                    seenByUser = true;

                    result = await this.getDataToFeedAlgorithm(cond, seenByUser, limit);

                    limit = postsByPage - resp?.length;
                    let topOldPosts = await this.feedAlgorithm(result, limit);
                    resp.push(topOldPosts);

                }
            } else {


                seenByUser = true;
                limit = standartLimit;

                result = await this.getDataToFeedAlgorithm(cond, seenByUser, limit);

                let oldPostsOrder = await this.feedAlgorithm(result, postsByPage);
                resp.push(oldPostsOrder);
            }
        } else {
            seenByUser = true;
            limit = standartLimit;

            result = await this.getDataToFeedAlgorithm(cond, seenByUser, limit);
            // now here you also add the offset
            let oldPostsOrder = await this.feedAlgorithm(result, postsByPage, offset);
            resp.push(oldPostsOrder);
        }


        if (lastSeenTimestamp) {
            await this.entityManager
                .createQueryBuilder()
                .update(UserFeed)
                .set({
                    lastSeenTimestamp: () => 'CURRENT_TIMESTAMP'
                })
                .where('userId = :userId', { userId: this.UserID })
                .execute();
        } else {
            await this.entityManager
                .createQueryBuilder()
                .insert()
                .into(UserFeed)
                .values({
                    userId: this.UserID,
                    lastSeenTimestamp: () => 'CURRENT_TIMESTAMP'
                })
                .execute();
        }
        return resp;
    }


    async getDataToFeedAlgorithm(cond: string = '', seenByUser: boolean, limit: any, offset: any = 0) {

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
            WHERE pl.deleted = FALSE
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
            '${seenByUser}' as "seenByUser",
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
        console.log(feedPostsQuery);
        let resp = await this.entityManager.query(feedPostsQuery);
        return resp;
    }




    async feedAlgorithm(posts, postsByPage: number, offset: number = 0) {

        let resp: any;
        const rankedPosts: any[] = [];

        for (const post of posts) {

            const score = (
                (post.postCreatedAt * 0.50) +
                (post.engagementCommentNr * 0.20) +
                (post.engagementLikeNr * 0.10) +
                (post.postCommentsNr * 0.13) +
                (post.postLikesNr * 0.07)
            );

            rankedPosts.push({ post, score });
        }

        // Step 5: Sort the rankedPosts list by score in descending order
        const sortedPosts = rankedPosts.sort((a, b) => b.score - a.score);

        // Step 6: Extract the top posts based on postsByPage and offset
        const topPosts = sortedPosts.slice(offset, offset + postsByPage);

        // Step 7: Return the top posts
        resp = topPosts.map(rankedPost => rankedPost.post);

        return resp;
    }




















}
