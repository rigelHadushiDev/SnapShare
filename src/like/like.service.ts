import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Post } from 'src/post/post.entity';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { PostLike } from './postLike.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { Story } from 'src/story/story.entity';
import { StoryLike } from './StoryLike.entity';

@Injectable()
export class LikeService {

    public currUserId: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserId = this.userProvider.getCurrentUser()?.userId;
    }



    async togglePostLike(postId: number) {
        const resp = new GeneralResponse();
        const userId = this.currUserId;

        const post = await this.entityManager
            .createQueryBuilder()
            .from(Post, 'post')
            .select('*')
            .where('post.postId = :postId', { postId })
            .andWhere('post.archive = :archiveState', { archiveState: false })
            .getOne();

        if (!post) throw new NotFoundException('postNotFound');

        const isLiked = await this.entityManager
            .createQueryBuilder()
            .from(PostLike, 'postLike')
            .select('*')
            .where('postLike.postId = :postId', { postId })
            .andWhere('postLike.userId = :userId', { userId })
            .andWhere('postLike.deleted = :deleted', { deleted: false })
            .getOne();

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
                    .where('postId = :postId', { postId: post.postId })
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
                    .where('postId = :postId', { postId: post.postId })
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

        const story = await this.entityManager
            .createQueryBuilder()
            .from(Story, 'story')
            .select('*')
            .where('story.storyId = :storyId', { storyId })
            .getOne();

        if (!story) throw new NotFoundException('storyNotFound');

        const isLiked = await this.entityManager
            .createQueryBuilder()
            .from(StoryLike, 'storyLike')
            .select('*')
            .where('storyLike.storyId = :storyId', { storyId })
            .andWhere('storyLike.userId = :userId', { userId })
            .andWhere('storyLike.deleted = :deleted', { deleted: false })
            .getOne();

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
                    .where('storyId = :storyId', { storyId: story?.storyId })
                    .execute();

                resp.message = 'postLikeRemoved';

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
                    .where('storyId = :storyId', { storyId: story?.storyId })
                    .execute();

                resp.message = 'postLikeAdded';
            }
        });

        resp.status = HttpStatus.OK;
        return resp;
    }


}
