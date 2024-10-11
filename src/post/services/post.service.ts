import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from '../post.entity';
import * as path from 'path';
import { Response, response } from 'express';
import { Observable } from 'rxjs';
import { DescriptionDto } from '../dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { GetFeedResp } from '../../feed/dtos/getFeed.dto';
import { CommentService } from 'src/comment/comment.service';
import { GetUserPostsRes } from '../dtos/getUsersPosts.dto';
import { GetPostIdRes } from '../dtos/GetPostIdRes.dto';
import { EditPostDto } from '../dtos/EditPost.dto';
const fs = require('fs');

@Injectable()
export class PostService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider, private readonly commentService: CommentService) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }

    async createPost(media: Express.Multer.File, postDataDto: DescriptionDto) {
        let resp: any

        const userId = this.UserID;

        if (!media) {
            throw new BadRequestException('mediaFileRequired')
        }

        const filePath: string = media.path;

        let post = new Post();

        let createdPost;

        await this.entityManager.transaction(async transactionalEntityManager => {

            post.userId = userId;
            post.postDescription = postDataDto?.description || null;
            post.media = filePath;

            createdPost = await transactionalEntityManager.save(Post, post);
        });

        if (createdPost.media)
            createdPost.media = SnapShareUtility.urlConverter(createdPost.media);

        resp = createdPost;

        return resp;
    };


    async toggleArchivePost(postId: number): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId = this.UserID;

        let postStatus = await await this.entityManager
            .createQueryBuilder()
            .from(Post, 'post')
            .select('post.archive')
            .where('post.postId = :postId', { postId })
            .getOne();

        postStatus.archive === true ? false : true;

        await this.entityManager
            .createQueryBuilder()
            .update(Post)
            .set({ archive: true })
            .where('postId = :postId', { postId })
            .andWhere('userId = :userId', { userId })
            .andWhere('archive = :archive', { archive: postStatus.archive })
            .execute();

        resp = { message: 'archiveToggleSuccessful', status: HttpStatus.OK };

        return resp;
    }


    async deletePost(postId: number): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId = this.UserID;

        const post = await this.findPostById(postId);

        if (post?.media) {
            const filePath = path.resolve(post.media);
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new InternalServerErrorException("issueDeletingPost");
                }
            });
        }

        const deleteQuery = await this.entityManager
            .createQueryBuilder()
            .delete()
            .from(Post)
            .where('postId = :postId', { postId })
            .andWhere('userId = :userId', { userId })
            .execute();

        if (deleteQuery.affected === 1 && post.media)
            resp = { message: 'postSuccessfullyDeleted', status: HttpStatus.OK };
        else
            resp = { message: 'postIsAlreadyDeleted', status: HttpStatus.OK };

        return resp;
    }

    async editPost(postId: number, postData: EditPostDto): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId = this.UserID;

        const post = await this.entityManager
            .createQueryBuilder(Post, 'post')
            .where('post.userId = :userId', { userId })
            .where('post.postId = :postId', { postId })
            .getOne();

        const { currPostDesc } = postData;

        if (currPostDesc === post?.postDescription) {
            throw new NotFoundException('newDescriptionShouldBeAdded');
        }

        const editPost = await this.entityManager
            .createQueryBuilder()
            .update(Post)
            .set({ postDescription: currPostDesc })
            .where('postId = :postId', { postId })
            .andWhere('userId = :userId', { userId })
            .execute();

        if (editPost?.affected === 1) {
            resp = { message: 'postSuccessfullyEdited', status: HttpStatus.OK };
        } else {
            throw new InternalServerErrorException('issueUpdatingPost');
        }

        return resp;
    }

    async findPostById(postId: number): Promise<Post> {

        const post = await this.entityManager.findOne(Post, {
            where: {
                postId: postId
            }
        });

        if (!post) {
            throw new NotFoundException(`postNotFound`);
        }

        return post;
    }

    async getUserPosts(postsByPage: number = 10, page: number = 1, userId: number, postCommentsLimit: number = 3) {


        let resp = new GetUserPostsRes();

        let offset = (page - 1) * postsByPage;

        let userPostsQuery = `WITH PostLikers AS (
            SELECT
                pl."postId",
                l."username",
                ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY n."networkId" ASC) AS rn
            FROM "postLike" pl
            INNER JOIN "user" l ON l."userId" = pl."userId"
            LEFT JOIN "network" n ON n."followeeId" = pl."userId"
                AND n.pending = FALSE 
                AND n.deleted = FALSE
                AND n."followerId" =  ${this.UserID}
            LEFT JOIN "post" pt ON pt."postId" = pl."postId"
                AND pt.archive = FALSE
            WHERE pl.deleted = FALSE 
            AND l.archive = FALSE 
            AND pt."userId" != pl."userId"
        )
        SELECT
            po."postId",
            po."postDescription",
            po."commentsNr" AS "postCommentsNr",
            po."likesNr" AS "postLikesNr",
            po.media AS "postMedia",
            po."userId" AS "postUserId",
            po."createdAt" AS "postCreatedAt",
            u."profileImg" AS "postProfileImg",
            CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
            CASE
                WHEN pl."likeId" IS NOT NULL THEN 'true' -- This checks if the current user (userId = 2) has liked the post
                ELSE 'false'
            END AS "postLikedByCurrUser",
            STRING_AGG(pls."username", ', ') AS "postLikersUsernames"
        FROM "post" po
        INNER JOIN "user" u ON u."userId" = po."userId" 
            AND u.archive = FALSE
        LEFT JOIN "postLike" pl ON pl."postId" = po."postId" 
            AND pl."userId" = ${this.UserID}
            AND pl.deleted = FALSE
        LEFT JOIN PostLikers pls ON pls."postId" = po."postId" 
            AND pls.rn <=${postCommentsLimit}
        WHERE po."userId" = ${userId} 
        AND po.archive = FALSE
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

        let posts = await this.entityManager.query(userPostsQuery)

        let userPostsContainer = [];
        if (posts?.length !== 0) {
            for (let post of posts) {
                let postContainer = [];

                if (post?.postMedia)
                    post.postMedia = SnapShareUtility.urlConverter(post.postMedia);

                if (post?.postProfileImg)
                    post.postProfileImg = SnapShareUtility.urlConverter(post.postProfileImg);

                let comment = await this.commentService.getComments(post.postId, postCommentsLimit)

                postContainer.push(post, comment)
                userPostsContainer.push(postContainer);
            }
        }
        resp = { userPostsContainer };
        return resp;
    }

    async getPostById(postId: number, postCommentsLimit: number = 3) {


        let resp = new GetPostIdRes();

        let userPostsQuery = `WITH PostLikers AS (
                    SELECT
                        pl."postId",
                        l."username",
                        ROW_NUMBER() OVER (PARTITION BY pl."postId" ORDER BY n."networkId" ASC) AS rn
                    FROM "postLike" pl
                    INNER JOIN "user" l ON l."userId" = pl."userId"
                    LEFT JOIN "network" n ON n."followeeId" = pl."userId"
                        AND n.pending = FALSE
                        AND n.deleted = FALSE
                        AND n."followerId" =  ${this.UserID}
                    LEFT JOIN "post" pt ON pt."postId" = pl."postId"
                        AND pt.archive = FALSE
                    WHERE pl.deleted = FALSE
                    AND l.archive = FALSE
                    AND pt."userId" != pl."userId"
                )
                SELECT
                    po."postId",
                    po."postDescription",
                    po."commentsNr" AS "postCommentsNr",
                    po."likesNr" AS "postLikesNr",
                    po.media AS "postMedia",
                    po."userId" AS "postUserId",
                    po."createdAt" AS "postCreatedAt",
                    u."profileImg" AS "postProfileImg",
                    CONCAT(u."firstName", ' ', u."lastName") AS "AccFullName",
                    CASE
                        WHEN pl."likeId" IS NOT NULL THEN 'true' 
                        ELSE 'false'
                    END AS "postLikedByCurrUser",
                    STRING_AGG(pls."username", ', ') AS "postLikersUsernames"
                FROM "post" po
                INNER JOIN "user" u ON u."userId" = po."userId"
                    AND u.archive = FALSE
                LEFT JOIN "postLike" pl ON pl."postId" = po."postId"
                    AND pl."userId" = ${this.UserID}
                    AND pl.deleted = FALSE
                LEFT JOIN PostLikers pls ON pls."postId" = po."postId"
                    AND pls.rn <= ${postCommentsLimit}
                WHERE po."postId" = ${postId} 
                AND po.archive = FALSE
                GROUP BY
                    po."postId",
                    u."profileImg",
                    u.username,
                    u."firstName",
                    u."lastName",
                    pl."likeId"
                ORDER BY po."createdAt" DESC;`

        let posts = await this.entityManager.query(userPostsQuery)

        let postIdContainer = [];
        if (posts?.length !== 0) {
            for (let post of posts) {
                let postContainer = [];

                if (post?.postMedia)
                    post.postMedia = SnapShareUtility.urlConverter(post.postMedia);

                if (post?.postProfileImg)
                    post.postProfileImg = SnapShareUtility.urlConverter(post.postProfileImg);

                let comment = await this.commentService.getComments(post.postId, postCommentsLimit)

                postContainer.push(post, comment)
                postIdContainer.push(postContainer);
            }
        }
        resp = { postIdContainer };
        return resp;
    }

}

















