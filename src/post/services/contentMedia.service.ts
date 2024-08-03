import { BadRequestException, Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Post } from '../post.entity';
import * as path from 'path';
import { Response } from 'express';
import { DescriptionDto } from '../dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
const fs = require('fs');

@Injectable()
export class ContentMediaService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }

    async getMedia(hashedUser: string, type: string, filename: string, res: Response) {
        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;
        res.sendFile(filePath);
    }


    // story feed


    // post feed


    // WITH PostLikers AS (
    //     SELECT
    //         pl."postId",
    //         l."username",
    //         ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY n."networkId" ASC) AS rn
    //     FROM "postLike" pl
    //     INNER JOIN "user" l ON l."userId" = pl."userId"
    //     LEFT JOIN "network" n ON n."followeeId" = l."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = 2
    //     WHERE pl.deleted = FALSE
    // )
    // SELECT 
    //     po."postId",
    //     po."postDescription",
    //     po."commentsNr",
    //     po."likesNr",
    //     po.media,
    //     po."userId",
    //     po."createdAt",
    //     u."profileImg",
    //     u.username,
    //     CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
    //     CASE 
    //         WHEN pl."likeId" IS NOT NULL THEN 'true'
    //         ELSE 'false'
    //     END AS "LikedByUser",
    //     STRING_AGG(pls."username", ', ') AS "LikersUsernames"
    // FROM "post" po
    // INNER JOIN "user" u ON u."userId" = po."userId" AND u.archive = false
    // LEFT JOIN "network" n ON n."followeeId" = po."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = 2
    // LEFT JOIN "postLike" pl ON pl."userId" = n."followerId" AND pl."postId" = po."postId" AND pl.deleted = false
    // LEFT JOIN PostLikers pls ON pls."postId" = po."postId" AND pls.rn <= 3
    // WHERE po.archive = FALSE AND n."networkId" IS NOT NULL
    // GROUP BY 
    //     po."postId",
    //     u."profileImg",
    //     u.username,
    //     u."firstName",
    //     u."lastName",
    //     pl."likeId"
    // ORDER BY po."createdAt" DESC;


    // WITH RECURSIVE CommentCTE AS (
    //     -- Base case: Select top-level comments
    //     SELECT 
    //         00000 AS depth,
    //         co."commentId"::INTEGER,
    //         co."likeNr"::INTEGER AS "commentLikeNr",
    //         co."parentCommentId"::INTEGER,
    //         co."createdAt",
    //         co."postId"::INTEGER,
    //         co."userId"::INTEGER,
    //         CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
    //                 co."commentDescription",
    //         u.username AS "commentUserName",
    //         CASE 
    //             WHEN cl."likeId" IS NOT NULL THEN 'true'
    //             ELSE 'false'
    //         END AS "LikedByUser",
    //         po."userId"::INTEGER AS "postUserId",
    //         CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
    //                 CASE
    //             WHEN co."userId" = 2 THEN 1
    //             WHEN cl."userId" = 2 THEN 3
    //            WHEN n."followerId" = 2 THEN 5
    //             ELSE 7
    //         END AS priority
    //     FROM "comment" co
    //     INNER JOIN "post" po ON po."postId" = co."postId" AND po.archive = FALSE
    //     INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
    //     LEFT JOIN "commentLike" cl ON cl."userId" = 2 AND cl."commentId" = co."commentId"
    //         LEFT JOIN "network" n ON n."followeeId" = co."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = 2
    //     WHERE po."postId" = 17 AND co."parentCommentId" IS NULL

    //     UNION ALL

    //     -- Recursive case: Select replies to comments
    //     SELECT 
    //         t.depth + 1 AS depth,
    //          co."commentId"::INTEGER,
    //         co."likeNr"::INTEGER AS "commentLikeNr",
    //         co."parentCommentId"::INTEGER,
    //         co."createdAt",
    //         co."postId"::INTEGER,
    //         co."userId"::INTEGER,
    //         CONCAT(u."firstName", ' ', u."lastName") AS "commentUserFullName",
    //                 co."commentDescription",
    //         u.username AS "commentUserName",
    //         CASE 
    //             WHEN cl."likeId" IS NOT NULL THEN 'true'
    //             ELSE 'false'
    //         END AS "LikedByUser",
    //         po."userId"::INTEGER AS "postUserId",
    //         CONCAT(co."commentId", '-', co."parentCommentId") AS unique_comment_id,
    //                 CASE
    //             WHEN co."userId" = 2 THEN 2
    //             WHEN cl."userId" = 2 THEN 4
    //             WHEN n_reply."followerId" = 2 THEN 6
    //             ELSE 8
    //         END AS priority
    //     FROM CommentCTE t
    //     INNER JOIN "comment" co ON co."parentCommentId" = t."commentId"
    //     INNER JOIN "post" po ON po."postId" = co."postId" AND po.archive = FALSE
    //     INNER JOIN "user" u ON u."userId" = co."userId" AND u.archive = FALSE
    //     LEFT JOIN "commentLike" cl ON cl."userId" = 2 AND cl."commentId" = co."commentId"
    //  LEFT JOIN "network" n_reply ON n_reply."followeeId" = co."userId" AND n_reply.pending = FALSE AND n_reply.deleted = FALSE AND n_reply."followerId" = 2
    // )
    // SELECT *
    // FROM CommentCTE
    // ORDER BY priority, depth, "createdAt" DESC;


}