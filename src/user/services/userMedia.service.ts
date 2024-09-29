import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../user.entity';
import { Post } from 'src/post/post.entity';
import { UserProvider } from './user.provider';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { GetFeedResp } from 'src/feed/dtos/getFeed.dto';
import { CommentService } from 'src/comment/comment.service';
const fs = require('fs');

@Injectable()
export class UserMediaService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider, private readonly commentService: CommentService) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }



    async postProfilePic(file: Express.Multer.File) {

        let resp: any;

        const userId: number = this.currUserID;

        if (!file)
            throw new BadRequestException('pleaseUploadImg');

        const filePath: string = file.path;

        let user = new User();

        await this.entityManager.transaction(async transactionalEntityManager => {

            user.userId = userId;
            user.profileImg = filePath;

            await transactionalEntityManager.save(User, user);
        });

        if (user && user?.profileImg) {
            user.profileImg = SnapShareUtility.urlConverter(user.profileImg);
        }

        resp = user;

        return resp;

    };

    async getArchivedPosts(postsByPage: number = 10, page: number = 1, postCommentsLimit: number = 3) {


        let resp = new GetFeedResp();

        let offset = (page - 1) * postsByPage;

        let feedPostsQuery = `
WITH PostLikers AS (
         SELECT
             pl."postId",
             l."username",
            ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY n."networkId" ASC) AS rn
        FROM "postLike" pl
        INNER JOIN "user" l ON l."userId" = pl."userId"
        LEFT JOIN "network" n ON n."followeeId" = l."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.currUserID}
         WHERE pl.deleted = FALSE
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
         STRING_AGG(pls."username", ', ') AS "postLikersUsernames"
     FROM "post" po
     INNER JOIN "user" u ON u."userId" = ${this.currUserID} AND u.archive = false
     LEFT JOIN "network" n ON n."followeeId" = po."userId" AND n.pending = FALSE AND n.deleted = FALSE AND n."followerId" = ${this.currUserID}
     LEFT JOIN "postLike" pl ON pl."userId" = n."followerId" AND pl."postId" = po."postId" AND pl.deleted = false
     LEFT JOIN PostLikers pls ON pls."postId" = po."postId" AND pls.rn <= 3
	 WHERE po.archive = TRUE AND u."userId" = ${this.currUserID}
     GROUP BY
         po."postId",
         u."profileImg",
         u.username,
         u."firstName",
         u."lastName",
         pl."likeId"
     ORDER BY po."createdAt" DESC
        LIMIT ${postsByPage}
        OFFSET ${offset};`

        let posts = await this.entityManager.query(feedPostsQuery)

        if (posts?.length == 0)
            throw new NotFoundException('noArchivedPosts');

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



    async getUserPosts(postsByPage: number = 10, page: number = 1) {
    }

    async getArchievedStories(postsByPage: number = 10, page: number = 1) {
    }

}