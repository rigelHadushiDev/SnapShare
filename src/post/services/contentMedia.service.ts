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
    //         STRING_AGG(DISTINCT l."username", ', ') AS "LikersUsernames"
    //     FROM "postLike" pl
    //     INNER JOIN "user" l ON l."userId" = pl."userId"
    //     WHERE pl.deleted = FALSE
    //     GROUP BY pl."postId"
    //         LIMIT 3
    // )
    // SELECT 
    // po."postId",
    //   po."postDescription",
    //   po."commentsNr",
    //   po."likesNr",
    //   po.media,
    //   po."userId",
    //   po."createdAt",
    //   u."profileImg",
    //   u.username,
    //   CONCAT(u."firstName", ' ', u."lastName") as "AccFullName",
    //   CASE 
    //     WHEN pl."likeId" IS NOT NULL THEN 'true'
    //     ELSE 'false'
    //   END AS "LikedByUser",
    //   COALESCE(pls."LikersUsernames", '') AS "LikersUsernames"
    // FROM "post" po
    // INNER JOIN "user" u ON u."userId" = po."userId" AND u.archive = false
    // LEFT JOIN "network" n ON n."followeeId" = po."userId" AND  n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = 2
    // LEFT JOIN "postLike" pl ON pl."userId" = n."followerId" AND pl."postId" = po."postId" AND pl.deleted = false
    // LEFT JOIN PostLikers pls ON pls."postId" = po."postId"
    // WHERE po.archive = FALSE AND n."networkId" IS NOT NULL;


}