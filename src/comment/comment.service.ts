import { ForbiddenException, HttpCode, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CommentPostDto } from './commentPost.dto';
import { UserProvider } from 'src/user/services/user.provider';
import { Post } from 'src/post/post.entity';
import { Comment } from './comment.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { CommentEditDto } from './commentEdit.dto';
import { EditPostDto } from 'src/post/dtos/EditPost.dto';
import { Network } from 'src/network/entities/network.entity';

@Injectable()
export class CommentService {

    public currUserId: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserId = this.userProvider.getCurrentUser()?.userId;
    }


    async commentPost(postData: CommentPostDto) {
        let resp = new GeneralResponse();

        const { postId, commentDescription, parentCommentId } = postData;

        const postExists = await this.entityManager
            .createQueryBuilder()
            .select('post.postId', 'postId')
            .addSelect('user.userId', 'userId')
            .addSelect('user.isPrivate', 'isPrivate')
            .from(Post, 'post')
            .leftJoin('user', 'user', 'post.userId = user.userId')
            .where('post.postId = :postId', { postId })
            .andWhere('post.archive = :archive', { archive: false })
            .getRawOne();

        if (!postExists) throw new NotFoundException('postNotFound');

        if (!postExists?.userId) throw new NotFoundException('userNotFound');

        const currUserFriend = await this.entityManager
            .createQueryBuilder(Network, 'network')
            .select('*')
            .where('network.followerId = :currUserId', { currUserId: this.currUserId })
            .andWhere('network.pending = :pendingStatus', { pendingStatus: false })
            .andWhere('network.followeeId = :followeeId', { followeeId: postExists?.userId })
            .getRawOne();

        if (postExists?.isPrivate && !currUserFriend && this.currUserId != postExists?.userId)
            throw new ForbiddenException(`nonFriendPrivateAccList`);

        await this.entityManager.transaction(async transactionalEntityManager => {

            await transactionalEntityManager
                .createQueryBuilder()
                .update(Post)
                .set({ commentsNr: () => 'commentsNr + 1' })
                .where('postId = :postId', { postId })
                .andWhere('archive = :archiveStatus', { archiveStatus: false })
                .execute();

            let comment = new Comment();
            comment.postId = postId;
            comment.userId = this.currUserId;
            comment.commentDescription = commentDescription;

            if (parentCommentId) {
                const parentComment = await this.entityManager
                    .createQueryBuilder()
                    .from(Comment, 'comment')
                    .select('comment.commentId')
                    .where('comment.commentId = :commentId', { commentId: parentCommentId })
                    .andWhere('comment.postId = :postId', { postId })
                    .getRawOne();

                if (!parentComment) throw new NotFoundException('parentCommentNotFound');

                comment.parentCommentId = parentCommentId;
                resp.message = 'commentReplySuccessfullyAdded';
            } else {
                resp.message = 'postCommentSuccessfullyAdded';
            }

            await transactionalEntityManager.save(Comment, comment);
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
}
