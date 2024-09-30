import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Post } from 'src/post/post.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { PostLike } from './entities/PostLike.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { Story } from 'src/story/story.entity';
import { StoryLike } from './entities/StoryLike.entity';
import { Comment } from 'src/comment/comment.entity';
import { CommentLike } from './entities/CommentLike.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { UserListRes } from 'src/network/responses/UserListRes';
import { Engagement } from 'src/feed/entities/engagement.entity';
import { EngagementType } from 'src/feed/entities/engagementType.entity';
import { NotificationService } from 'src/notification/notification.service';


@Injectable()
export class LikeService {

    public currUserId: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider, private readonly notificationService: NotificationService) {
        this.currUserId = this.userProvider.getCurrentUser()?.userId;
    }

    async togglePostLike(postId: number) {
        const resp = new GeneralResponse();
        const userId = this.currUserId;

        const isLiked = await this.entityManager
            .createQueryBuilder()
            .from(PostLike, 'postLike')
            .select('*')
            .where('postLike.postId = :postId', { postId })
            .andWhere('postLike.userId = :userId', { userId })
            .andWhere('postLike.deleted = :deleted', { deleted: false })
            .getRawOne();

        const post = await this.entityManager
            .createQueryBuilder(Post, 'post')
            .select('post.userId', 'userId')
            .where('post.postId = :postId', { postId })
            .andWhere('post.archive = :archive', { archive: false })
            .getRawOne();

        const engagement = await this.entityManager
            .createQueryBuilder(Engagement, 'e')
            .select('e.engagementId', 'engagementId')
            .innerJoin(EngagementType, 'et', 'e.engagementTypeId = et.engagementTypeId')
            .where('et.type = :type', { type: 'LIKE' })
            .andWhere(
                '(e.userId1 = :userId1 AND e.userId2 = :userId2) OR (e.userId1 = :userId2 AND e.userId2 = :userId1)',
                { userId1: this.currUserId, userId2: post.userId }
            )
            .getRawOne();

        await this.entityManager.transaction(async transactionalEntityManager => {
            if (isLiked) {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(PostLike)
                    .set({ deleted: true })
                    .where('likeId = :likeId', { likeId: isLiked.likeId })
                    .execute();

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Post)
                    .set({ likesNr: () => 'likesNr - 1' })
                    .where('postId = :postId', { postId: postId })
                    .execute();

                if (engagement) {

                    await transactionalEntityManager
                        .createQueryBuilder()
                        .update(Engagement)
                        .set({ engagementNr: () => 'engagementNr - 1' })
                        .where('engagementId = :engagementId', { engagementId: engagement.engagementId })
                        .execute();

                }

                resp.message = 'postLikeRemoved';
            } else {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(PostLike)
                    .values({
                        userId,
                        postId
                    })
                    .execute();

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Post)
                    .set({ likesNr: () => 'likesNr + 1' })
                    .where('postId = :postId', { postId: postId })
                    .execute();

                await this.notificationService.createNotification(this.currUserId, post.userId, 1, postId);

                const engagementQuery = `
                          WITH engagement_type AS (
                              SELECT "engagementTypeId"
                              FROM "engagementType"
                              WHERE "type" = 'LIKE'
                          )
                          INSERT INTO "engagement" ("userId1", "userId2", "engagementTypeId", "engagementNr")
                          SELECT 
                              LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)), 
                              GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)),
                              "engagementTypeId",
                              1
                          FROM engagement_type
                          ON CONFLICT ("userId1", "userId2", "engagementTypeId") DO UPDATE
                          SET "engagementNr" = "engagement"."engagementNr" + 1`;

                await transactionalEntityManager.query(engagementQuery, [this.currUserId, post.userId]);

                resp.message = 'postLikeAdded';
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }

    async toggleStoryLike(storyId: number) {
        const resp = new GeneralResponse();
        const userId = this.currUserId;

        const isLiked = await this.entityManager
            .createQueryBuilder()
            .from(StoryLike, 'storyLike')
            .select('*')
            .where('storyLike.storyId = :storyId', { storyId })
            .andWhere('storyLike.userId = :userId', { userId })
            .andWhere('storyLike.deleted = :deleted', { deleted: false })
            .getRawOne();


        const story = await this.entityManager
            .createQueryBuilder(Story, 'story')
            .select('story.userId', 'userId')
            .where('story.storyId = :storyId', { storyId })
            .andWhere('story.archive = :archive', { archive: false })
            .getRawOne();

        const engagement = await this.entityManager
            .createQueryBuilder(Engagement, 'e')
            .select('e.engagementId', 'engagementId')
            .innerJoin(EngagementType, 'et', 'e.engagementTypeId = et.engagementTypeId')
            .where('et.type = :type', { type: 'LIKE' })
            .andWhere(
                '(e.userId1 = :userId1 AND e.userId2 = :userId2) OR (e.userId1 = :userId2 AND e.userId2 = :userId1)',
                { userId1: this.currUserId, userId2: story.userId }
            )
            .getRawOne();

        await this.entityManager.transaction(async transactionalEntityManager => {
            if (isLiked) {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(StoryLike)
                    .set({ deleted: true })
                    .where('likeId = :likeId', { likeId: isLiked?.likeId })
                    .execute();

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Story)
                    .set({ likesNr: () => 'likesNr - 1' })
                    .where('storyId = :storyId', { storyId: storyId })
                    .execute();

                if (engagement) {

                    await transactionalEntityManager
                        .createQueryBuilder()
                        .update(Engagement)
                        .set({ engagementNr: () => 'engagementNr - 1' })
                        .where('engagementId = :engagementId', { engagementId: engagement.engagementId })
                        .execute();

                }
                resp.message = 'storyLikeRemoved';

            } else {

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(StoryLike)
                    .values({
                        userId,
                        storyId
                    })
                    .execute();

                await this.notificationService.createNotification(this.currUserId, story.userId, 2, storyId);

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Story)
                    .set({ likesNr: () => 'likesNr + 1' })
                    .where('storyId = :storyId', { storyId: storyId })
                    .execute();


                const engagementQuery = `
                WITH engagement_type AS (
                    SELECT "engagementTypeId"
                    FROM "engagementType"
                    WHERE "type" = 'LIKE'
                )
                INSERT INTO "engagement" ("userId1", "userId2", "engagementTypeId", "engagementNr")
                SELECT 
                    LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)), 
                    GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)),
                    "engagementTypeId",
                    1
                FROM engagement_type
                ON CONFLICT ("userId1", "userId2", "engagementTypeId") DO UPDATE
                SET "engagementNr" = "engagement"."engagementNr" + 1`;

                await transactionalEntityManager.query(engagementQuery, [this.currUserId, story.userId]);
                resp.message = 'storyLikeAdded';
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }

    async toggleCommentLike(commentId: number) {
        const resp = new GeneralResponse();
        const userId = this.currUserId;

        const commmentExist = await this.entityManager
            .createQueryBuilder()
            .from(Comment, 'comment')
            .select('*')
            .where('comment.commentId = :commentId', { commentId })
            .getRawOne();

        if (!commmentExist) throw new NotFoundException('commentNotFound');

        const isLiked = await this.entityManager
            .createQueryBuilder()
            .from(CommentLike, 'commentlike')
            .select('*')
            .where('commentlike.commentId = :commentId', { commentId })
            .andWhere('commentlike.userId = :userId', { userId })
            .andWhere('commentlike.deleted = :deleted', { deleted: false })
            .getRawOne();

        await this.notificationService.createNotification(this.currUserId, commmentExist.userId, 2, commentId);

        const engagement = await this.entityManager
            .createQueryBuilder(Engagement, 'e')
            .select('e.engagementId', 'engagementId')
            .innerJoin(EngagementType, 'et', 'e.engagementTypeId = et.engagementTypeId')
            .where('et.type = :type', { type: 'LIKE' })
            .andWhere(
                '(e.userId1 = :userId1 AND e.userId2 = :userId2) OR (e.userId1 = :userId2 AND e.userId2 = :userId1)',
                { userId1: this.currUserId, userId2: commmentExist.userId }
            )
            .getRawOne();

        await this.entityManager.transaction(async transactionalEntityManager => {
            if (isLiked) {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(CommentLike)
                    .set({ deleted: true })
                    .where('likeId = :likeId', { likeId: isLiked?.likeId })
                    .execute();

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Comment)
                    .set({ likesNr: () => 'likesNr - 1' })
                    .where('commentId = :commentId', { commentId: commmentExist?.commentId })
                    .execute();

                if (engagement) {

                    await transactionalEntityManager
                        .createQueryBuilder()
                        .update(Engagement)
                        .set({ engagementNr: () => 'engagementNr - 1' })
                        .where('engagementId = :engagementId', { engagementId: engagement.engagementId })
                        .execute();

                }

                resp.message = 'commentLikeRemoved';

            } else {

                await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(CommentLike)
                    .values({
                        userId,
                        commentId
                    })
                    .execute();

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Comment)
                    .set({ likesNr: () => 'likesNr + 1' })
                    .where('commentId = :commentId', { commentId: commmentExist?.commentId })
                    .execute();

                const engagementQuery = `
                    WITH engagement_type AS (
                        SELECT "engagementTypeId"
                        FROM "engagementType"
                        WHERE "type" = 'LIKE'
                    )
                    INSERT INTO "engagement" ("userId1", "userId2", "engagementTypeId", "engagementNr")
                    SELECT 
                        LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)), 
                        GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)),
                        "engagementTypeId",
                        1
                    FROM engagement_type
                    ON CONFLICT ("userId1", "userId2", "engagementTypeId") DO UPDATE
                    SET "engagementNr" = "engagement"."engagementNr" + 1`;

                await transactionalEntityManager.query(engagementQuery, [this.currUserId, commmentExist.userId]);
                resp.message = 'commentLikeAdded';
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }

    async getPostLikers(postId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new UserListRes;

        let skip: number = (page - 1) * postsByPage;

        const query = `SELECT
            u."userId",
            u."username",
            u."profileImg",
            CASE 
                WHEN EXISTS(
                    SELECT 1 
                    FROM network n 
                    WHERE n."followerId" = $1 -- The current user's ID
                    AND n."followeeId" = u."userId" -- The user who liked the post
                    AND n."pending" = false 
                    AND n."deleted" = false
                ) THEN true 
                ELSE false 
            END AS "isFollowedByCurrUser",
            CASE 
                WHEN u."userId" = $1 THEN true 
                ELSE false 
            END AS "isCurrentUser"
        FROM 
            "postLike" pl
        JOIN 
            "user" u ON pl."userId" = u."userId"
        WHERE 
            pl."postId" = $2
        LIMIT $3 OFFSET $4;`;


        const postLikersList = await this.entityManager.query(query, [this.currUserId, postId, postsByPage, skip]);


        for (const likers of postLikersList) {
            if (likers?.profileImg)
                likers.profileImg = SnapShareUtility.urlConverter(likers.profileImg);
        }

        resp = postLikersList

        return resp;
    }

    async getStoryLikers(storyId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new UserListRes;

        // only owner of th story can see the acc which liked its story and it can be also archived story

        const storyExist = await this.entityManager
            .createQueryBuilder()
            .from(Story, 's')
            .select('*')
            .where('s.storyId = :storyId', { storyId })
            .getRawOne();

        if (!storyExist)
            throw new NotFoundException('storyNotFound');

        if (storyExist.userId !== this.currUserId)
            throw new UnauthorizedException('onlyStoryOwnerHasAccess');

        let skip: number = (page - 1) * postsByPage;

        const query = `SELECT
            u."userId",
            u."username",
            u."profileImg",
            CASE 
                WHEN EXISTS(
                    SELECT 1 
                    FROM network n 
                    WHERE n."followerId" = $1 
                    AND n."followeeId" = u."userId" 
                    AND n."pending" = false 
                    AND n."deleted" = false
                ) THEN true 
                ELSE false 
            END AS "isFollowedByCurrUser",
            CASE 
                WHEN u."userId" = $1 THEN true 
                ELSE false 
            END AS "isCurrentUser"
        FROM 
            "storyLike" sl
        JOIN 
            "user" u ON sl."userId" = u."userId"
        WHERE 
            sl."storyId" = $2
        LIMIT $3 OFFSET $4;`;


        const storyLikersList = await this.entityManager.query(query, [this.currUserId, storyId, postsByPage, skip]);


        for (const likers of storyLikersList) {
            if (likers?.profileImg)
                likers.profileImg = SnapShareUtility.urlConverter(likers.profileImg);
        }

        resp = storyLikersList

        return resp;
    }
}
