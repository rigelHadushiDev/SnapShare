import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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


@Injectable()
export class LikeService {

    public currUserId: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
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

                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Story)
                    .set({ likesNr: () => 'likesNr + 1' })
                    .where('storyId = :storyId', { storyId: storyId })
                    .execute();

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

                resp.message = 'commentLikeAdded';
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }

    async getPostLikers(postId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new UserListRes;

        let skip: number = (page - 1) * postsByPage;

        // limit => postsByPage,  offset => skip

        let postOwnerUser = await this.entityManager
            .createQueryBuilder()
            .from(Post, 'p')
            .select('p.userId')
            .where('p.postId = :postId', { postId })
            .getRawOne();

        // if post exist gets checked by the guard
        let userId = postOwnerUser?.userId;

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
}
