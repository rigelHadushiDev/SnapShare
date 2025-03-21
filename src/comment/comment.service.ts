import { BadRequestException, ForbiddenException, HttpCode, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CommentPostDto } from './dtos/commentPost.dto';
import { UserProvider } from 'src/user/services/user.provider';
import { Post } from 'src/post/post.entity';
import { Comment } from './comment.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { CommentEditDto } from './dtos/commentEdit.dto';
import { Network } from 'src/network/entities/network.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { CommentDto } from 'src/feed/dtos/getFeed.dto';
import { GetCommentRes } from './dtos/getComments.dto';
import { GetCommentRepliesRes } from './dtos/getCommentReplies.dto';
import { Engagement } from 'src/feed/entities/engagement.entity';
import { EngagementType } from 'src/feed/entities/engagementType.entity';
import { User } from 'src/user/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { GetCommentResp } from './dtos/getCommentResp.dto';

@Injectable()
export class CommentService {

    public currUserId: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider,
        private readonly notificationService: NotificationService) {
        this.currUserId = this.userProvider.getCurrentUser()?.userId;
    }

    async commentPost(postData: CommentPostDto) {
        let resp = new GeneralResponse();
        const { postId, commentDescription, parentCommentId } = postData;

        const post = await this.entityManager
            .createQueryBuilder(Post, 'p')
            .select('p.postId', 'postId')
            .addSelect('p.userId', 'userId')
            .where('p.postId = :postId', { postId })
            .andWhere('p.archive = false')
            .getRawOne(); // Use getRawOne() to get the raw result with aliases

        await this.entityManager.transaction(async transactionalEntityManager => {
            // Increment comment count
            await transactionalEntityManager
                .createQueryBuilder()
                .update(Post)
                .set({ commentsNr: () => 'commentsNr + 1' })
                .where('postId = :postId', { postId })
                .andWhere('archive = false')
                .execute();

            // Create and save the comment
            let comment = new Comment();
            comment.postId = postId;
            comment.userId = this.currUserId;
            comment.commentDescription = commentDescription;

            let userId2 = post.userId;
            let typeId: number = 7;
            let targetId: number = postId;
            // If replying to a parent comment
            if (parentCommentId) {
                const parentComment = await this.entityManager
                    .createQueryBuilder(Comment, 'comment')
                    .select(['comment.commentId', 'comment.userId'])
                    .select('comment.commentId', 'commentId')
                    .addSelect('comment.userId', 'userId')
                    .where('comment.commentId = :commentId', { commentId: parentCommentId })
                    .andWhere('comment.postId = :postId', { postId })
                    .getRawOne();

                if (!parentComment) throw new NotFoundException('Parent comment not found');

                userId2 = parentComment.userId;
                comment.parentCommentId = parentCommentId;
                resp.message = 'Comment reply successfully added';
                typeId = 8;
                targetId = parentCommentId;


            } else {
                resp.message = 'Post comment successfully added';
            }
            let createdComment = await transactionalEntityManager.save(Comment, comment);
            await this.notificationService.createNotification(this.currUserId, userId2, typeId, createdComment.commentId, targetId, commentDescription)

            // Handle engagements with the comment user
            const engagementQuery = `
              WITH engagement_type AS (
                SELECT "engagementTypeId"
                FROM "engagementType"
                WHERE "type" = 'COMMENT'
                )
                INSERT INTO "engagement" ("userId1", "userId2", "engagementTypeId", "engagementNr")
                SELECT
                LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)), 
                GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)),
                "engagementTypeId",
                1
                FROM engagement_type
                ON CONFLICT ("userId1", "userId2", "engagementTypeId") DO UPDATE
                SET "engagementNr" = "engagement"."engagementNr" + 1; `;

            // Update engagement with the comment user
            await transactionalEntityManager.query(engagementQuery, [this.currUserId, userId2]);

            // Update engagement with the post owner
            if (userId2 !== post.userId) {
                await transactionalEntityManager.query(engagementQuery, [this.currUserId, post.userId]);
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }

    async deleteComment(commentId: number) {

        let resp: any;

        const commentWithPost = await this.entityManager
            .createQueryBuilder()
            .from(Comment, 'c')
            .leftJoin(Post, 'p', 'c.postId = p.postId')
            .select('p.postId', 'postId')
            .addSelect('c.commentId', 'commentId')
            .addSelect('c.userId', 'userId')
            .addSelect('c.parentCommentId', 'parentCommentId')
            .addSelect('p.userId', 'postOwnerId')
            .addSelect('p.archive', 'archive')
            .where('c.commentId = :commentId', { commentId })
            .getRawOne();

        if (!commentWithPost?.commentId)
            throw new NotFoundException('commentNotFound');

        if (!commentWithPost?.postOwnerId || commentWithPost.archive)
            throw new NotFoundException('postNotFound');

        if (commentWithPost.postOwnerId !== this.currUserId && commentWithPost.userId !== this.currUserId)
            throw new ForbiddenException('cannotDeleteComment');


        await this.entityManager.transaction(async transactionalEntityManager => {
            const comments = await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Comment)
                .where('commentId = :commentId OR parentCommentId = :commentId', { commentId })
                .execute();

            await transactionalEntityManager
                .createQueryBuilder()
                .update(Post)
                .set({ commentsNr: () => `commentsNr - ${comments?.affected || 0}` })
                .where('postId = :postId', { postId: commentWithPost?.postId })
                .andWhere('archive = :archiveStatus', { archiveStatus: false })
                .execute();

            await this.entityManager.query(
                `   WITH engagement_type AS (
                      SELECT "engagementTypeId"
                      FROM "engagementType"
                      WHERE "type" = 'COMMENT'
                    )
                    UPDATE "engagement"
                    SET "engagementNr" = "engagement"."engagementNr" - 1
                    WHERE (
                      LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)) = LEAST("userId1", "userId2")
                      AND GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)) = GREATEST("userId1", "userId2")
                      AND "engagementTypeId" = (SELECT "engagementTypeId" FROM engagement_type)
                    )
                    AND "engagementNr" > 0;
                    `,
                [commentWithPost.postOwnerId, this.currUserId]
            );
            let parentCommentId = commentWithPost?.parentCommentId;
            if (parentCommentId) {

                const parentCommentUserId = await this.entityManager
                    .createQueryBuilder()
                    .from(Comment, 'c')
                    .select('c."userId"', 'userId')
                    .where('c."commentId" = :parentCommentId', { parentCommentId })
                    .getRawOne();

                await this.entityManager.query(
                    `
                WITH engagement_type AS (
                  SELECT "engagementTypeId"
                  FROM "engagementType"
                  WHERE "type" = 'COMMENT'
                )
                UPDATE "engagement"
                SET "engagementNr" = "engagement"."engagementNr" - 1
                WHERE (
                  LEAST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)) = LEAST("userId1", "userId2")
                  AND GREATEST(CAST($1 AS INTEGER), CAST($2 AS INTEGER)) = GREATEST("userId1", "userId2")
                  AND "engagementTypeId" = (SELECT "engagementTypeId" FROM engagement_type)
                )
                AND "engagementNr" > 0;
                `,
                    [parentCommentUserId.userId, this.currUserId]
                );
            }

        })

        resp = { status: HttpStatus.OK, message: 'commentSuccessfullyDeleted' };

        return resp;
    }

    async editComment(postData: CommentEditDto) {

        let resp = new CommentEditDto();

        let { commentDescription, commentId } = postData;

        let commentExists = await this.entityManager
            .createQueryBuilder()
            .select("*")
            .from(Comment, 'comment')
            .where('comment.commentId = :commentId', { commentId })
            .getRawOne();

        if (!commentExists)
            throw new NotFoundException(`commentNotFound`);

        if (commentExists?.userId !== this.currUserId)
            throw new ForbiddenException('cannotEditComment');

        await this.entityManager
            .createQueryBuilder()
            .update(Comment)
            .set({ commentDescription: commentDescription })
            .where('commentId = :commentId', { commentId })
            .execute();

        resp = { commentDescription: commentDescription, commentId: commentId };

        return resp;
    }

    async getComments(postId: number, feedCommentsLimit?: number, postsByPage: number = 10, page: number = 1) {

        let res = new GetCommentRes;
        let limit: string = '';

        let offsetCond: string = '';
        let offset = (page - 1) * postsByPage;

        offsetCond = `OFFSET ${offset}`;

        limit = `LIMIT ${postsByPage}`

        if (feedCommentsLimit)
            limit = `LIMIT ${feedCommentsLimit}`;

        let comments = await this.entityManager.query(
            `  WITH RECURSIVE CommentCTE AS (
            -- Base case: Select top-level comments
            SELECT 
                0 AS depth,
                co."commentId"::INTEGER,
                co."likeNr"::INTEGER AS "commentLikeNr",
                co."commentId"::INTEGER AS "parentCommentId",
                        u."profileImg":: VARCHAR,
                 co."createdAt":: TIMESTAMP,
                co."postId"::INTEGER,
                co."userId"::INTEGER,
                CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
                co."commentDescription",
                u.username AS "commentUserName",
                CASE 
                    WHEN cl."likeId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "LikedByUser",
                po."userId"::INTEGER AS "postUserId",
                CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
                CASE
                    WHEN co."userId" = ${this.currUserId} THEN 1
                    WHEN cl."userId" = ${this.currUserId} THEN 3
                    WHEN n."followerId" = ${this.currUserId} THEN 5
                    ELSE 7
                END AS priority
            FROM "comment" co
            INNER JOIN "post" po ON po."postId" = co."postId" 
            INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
            LEFT JOIN "commentLike" cl ON cl."userId" = ${this.currUserId} AND cl."commentId" = co."commentId"
            LEFT JOIN "network" n ON n."followeeId" = co."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.currUserId}
            WHERE po."postId" = ${postId} AND co."parentCommentId" IS NULL
        
            UNION ALL
        
            -- Recursive case: Select replies to comments
            SELECT 
                t.depth + 1 AS depth,
                co."commentId"::INTEGER,
                co."likeNr"::INTEGER AS "commentLikeNr",
                co."parentCommentId"::INTEGER,
                        u."profileImg":: VARCHAR,
                co."createdAt":: TIMESTAMP,
                co."postId"::INTEGER,
                co."userId"::INTEGER,
                CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
                co."commentDescription",
                u.username AS "commentUserName",
                CASE 
                    WHEN cl."likeId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "LikedByUser",
                po."userId"::INTEGER AS "postUserId",
                CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
                CASE
                    WHEN co."userId" = ${this.currUserId} THEN 2
                    WHEN cl."userId" = ${this.currUserId} THEN 4
                    WHEN n_reply."followerId" = ${this.currUserId} THEN 6
                    ELSE 8
                END AS priority
            FROM CommentCTE t
            INNER JOIN "comment" co ON co."parentCommentId" = t."commentId"
            INNER JOIN "post" po ON po."postId" = co."postId" 
            INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
            LEFT JOIN "commentLike" cl ON cl."userId" = ${this.currUserId} AND cl."commentId" = co."commentId"
            LEFT JOIN "network" n_reply ON n_reply."followeeId" = co."userId" AND n_reply.pending = FALSE AND n_reply.deleted = FALSE AND n_reply."followerId" = ${this.currUserId}
        )
        SELECT *
        FROM CommentCTE
        Where depth < 2 
        ORDER BY 
         "parentCommentId" ASC,
          depth ASC,             
          priority ASC,            
          "createdAt" DESC
        ${limit}
        ${offsetCond};`
        );

        if (comments.length > 0) {
            for (let comment of comments) {
                if (comment?.profileImg)
                    comment.profileImg = SnapShareUtility.urlConverter(comment.profileImg);
            }
        }
        res = comments;

        return res;

    }

    async getCommentReplies(commentId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new GetCommentRepliesRes();

        // check if comment exist
        let parentsCounter = await this.entityManager.query(`
            WITH RECURSIVE CommentHierarchy AS (
            -- Anchor member: start with the given comment
            SELECT 
                "commentId", 
                "parentCommentId", 
                0 AS depth
            FROM "comment"
            WHERE "commentId" = ${commentId}

            UNION ALL

            -- Recursive member: select the parent comment of the current comment
            SELECT 
                co."commentId", 
                co."parentCommentId", 
                t.depth + 1
            FROM "comment" co
            JOIN CommentHierarchy t ON co."commentId" = t."parentCommentId"
            ),
            CommentExistenceCheck AS (
            SELECT COUNT(*) > 0 AS exists
            FROM "comment"
            WHERE "commentId" = ${commentId}
            )
            SELECT 
            CASE 
                WHEN (SELECT exists FROM CommentExistenceCheck) THEN (SELECT MAX(depth) FROM CommentHierarchy)
                ELSE -1
            END AS parentCount;`)

        if (parentsCounter?.length > 0) {

            if (parentsCounter[0]?.parentcount === -1)
                throw new NotFoundException('commentIdNotFound');
            else
                parentsCounter = parentsCounter[0]?.parentcount;
        }

        let offset = (page - 1) * postsByPage;

        let commentReplies = await this.entityManager.query(`
            WITH RECURSIVE CommentCTE AS(
            -- Base case: Select base comment
            SELECT 
                ${parentsCounter} AS depth,
                co."commentId"::INTEGER,
                co."likeNr"::INTEGER AS "commentLikeNr",
                co."commentId"::INTEGER AS "parentCommentId",
                u."profileImg":: VARCHAR,
                co."createdAt":: TIMESTAMP,
                co."postId"::INTEGER,
                co."userId"::INTEGER,
                CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
                co."commentDescription",
                u.username AS "commentUserName",
                CASE 
                    WHEN cl."likeId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "LikedByUser",
                CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
                CASE
                    WHEN co."userId" = ${this.currUserId} THEN 1
                    WHEN cl."userId" = ${this.currUserId} THEN 3
                    WHEN n."followerId" = ${this.currUserId} THEN 5
                    ELSE 7
                END AS priority
            FROM "comment" co
            INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
            LEFT JOIN "commentLike" cl ON cl."userId" = ${this.currUserId} AND cl."commentId" = co."commentId"
            LEFT JOIN "network" n ON n."followeeId" = co."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.currUserId}
            WHERE co."commentId"= ${commentId}
        
            UNION ALL
        
            -- Recursive case: Select replies to comments
            SELECT 
                t.depth + 1 AS depth,
                co."commentId"::INTEGER,
                co."likeNr"::INTEGER AS "commentLikeNr",
                co."parentCommentId"::INTEGER,
                u."profileImg":: VARCHAR,
                co."createdAt":: TIMESTAMP,
                co."postId"::INTEGER,
                co."userId"::INTEGER,
                CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
                co."commentDescription",
                u.username AS "commentUserName",
                CASE 
                    WHEN cl."likeId" IS NOT NULL THEN 'true'
                    ELSE 'false'
                END AS "LikedByUser",
                CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
                CASE
                    WHEN co."userId" = ${this.currUserId} THEN 2
                    WHEN cl."userId" = ${this.currUserId} THEN 4
                    WHEN n_reply."followerId" = ${this.currUserId} THEN 6
                    ELSE 8
                END AS priority
            FROM CommentCTE t
            INNER JOIN "comment" co ON co."parentCommentId" = t."commentId"
            INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
            LEFT JOIN "commentLike" cl ON cl."userId" = ${this.currUserId} AND cl."commentId" = co."commentId"
            LEFT JOIN "network" n_reply ON n_reply."followeeId" = co."userId" AND n_reply.pending = FALSE AND n_reply.deleted = FALSE AND n_reply."followerId" = ${this.currUserId}
        )
        SELECT *
        FROM CommentCTE
        Where depth < ${parentsCounter + 2}
        ORDER BY 
        "parentCommentId" ASC,
        depth asc,
        priority ASC,            
        "createdAt" DESC
         LIMIT ${postsByPage}
        OFFSET ${offset};`)

        resp = commentReplies;

        return resp;
    }

    async getCommentById(commentId: number) {

        let resp = new GetCommentResp();

        const comment = await this.entityManager.findOne(Comment, {
            where: [{ commentId }],
        });

        let post = await this.entityManager.findOne(Post, {
            where: [{ postId: comment.postId }],
        });

        let postOwnerId: number = post.userId;

        let user = await this.entityManager.findOne(User, {
            where: [{ userId: postOwnerId }],
        });

        if (user.isPrivate) {

            const isUserNetwork = await this.entityManager
                .createQueryBuilder()
                .from(Network, 'network')
                .select('*')
                .where('network.followerId = :followerId', { followerId: this.currUserId })
                .andWhere('network.followeeId = :followeeId', { followeeId: postOwnerId })
                .andWhere('network.deleted = :deleted', { deleted: false })
                .andWhere('network.pending = :pending', { pending: false })
                .getRawOne();

            if (!isUserNetwork)
                throw new ForbiddenException('nonFriendPrivateAccList');

        }

        let commentOwner = await this.entityManager.findOne(User, {
            where: [{ userId: comment.userId }]
        });

        if (commentOwner?.profileImg)
            commentOwner.profileImg = SnapShareUtility.urlConverter(commentOwner.profileImg);


        Object.assign(resp, comment);

        resp.username = commentOwner?.username;
        resp.profileImg = commentOwner?.profileImg;

        return resp;
    }
}

