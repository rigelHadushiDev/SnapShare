import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';
import * as path from 'path';
import { Response, response } from 'express';
import { EditPostDto } from './dtos/editPost.dto';
import { Observable } from 'rxjs';
const fs = require('fs');

@Injectable()
export class PostService {

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) { }

    // this is done only add the type of the method <> promise
    async postFile(file: any, postData: any) {
        let resp: any

        const userId = this.userProvider.getCurrentUser().userId;
        const filePath: string = file.path;
        let post = new Post();
        let postDescription = postData.postDescription.replace(/^'(.*)'$/, '$1');

        await this.entityManager.transaction(async transactionalEntityManager => {
            post.userId = userId;
            post.postDescription = postDescription;
            post.media = filePath;

            await transactionalEntityManager.save(Post, post);
        });

        resp = post;

        return resp;
    };

    // this is an example with pagination , query should change so you can get the friends posts and not your posts
    async getUserPosts(take: number = 10, skip: number = 0) {

        let resp: any;

        const userId = this.userProvider.getCurrentUser().userId;

        const posts = await this.entityManager
            .createQueryBuilder(Post, 'post')
            .where('post.userId = :userId', { userId })
            .andWhere('post.archived = :archived', { archived: false })
            .take(take)
            .skip(skip)
            .getMany();


        for (const post of posts) {
            const pathParts = post.media.split(/[\/\\]/);
            // this needs to be changed later so we use only one controller
            post.media = `${process.env.DOMAIN_NAME}/post/display/posts/${pathParts[pathParts.length - 3]}/${pathParts[pathParts.length - 1]}`;
        }

        resp = posts;

        return resp;
    };

    // fileProvider can be named
    async getUserMedia(hashedUser: string, type: string, filename: string, res: Response) {
        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;
        res.sendFile(filePath);
    }

    async archivePost(postId: number): Promise<{ message: string; status: number }> {
        let resp: { message: string; status: number };

        const userId: string = this.userProvider.getCurrentUser()?.userId;

        const result = await this.entityManager
            .createQueryBuilder()
            .update(Post)
            .set({ archived: true })
            .where('postId = :postId', { postId })
            .andWhere('userId = :userId', { userId })
            .andWhere('archived = :archived', { archived: false })
            .execute();

        if (result.affected === 1) {
            resp = { message: 'postSuccessfullyArchived', status: HttpStatus.OK };
        } else {
            resp = { message: 'postIsAlreadyArchivedOrNotExist', status: HttpStatus.OK };
        }
        return resp;
    }


    async deletePost(postId: number): Promise<{ message: string; status: number }> {
        let resp: { message: string; status: number };


        const userId: string = this.userProvider.getCurrentUser()?.userId;

        const post = await this.entityManager
            .createQueryBuilder(Post, 'post')
            .where('post.userId = :userId', { userId })
            .where('post.postId = :postId', { postId })
            .getOne();

        if (!post) {
            throw new NotFoundException('postNotFound');
        }

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

        if (deleteQuery.affected === 1 && post.media) {
            resp = { message: 'postSuccessfullyDeleted', status: HttpStatus.OK };
        } else {
            resp = { message: 'postIsAlreadyDeleted', status: HttpStatus.OK };
        }
        return resp;
    }

    async editPost(postId: number, postData: EditPostDto): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId: string = this.userProvider.getCurrentUser()?.userId;

        const post = await this.entityManager
            .createQueryBuilder(Post, 'post')
            .where('post.userId = :userId', { userId })
            .where('post.postId = :postId', { postId })
            .getOne();

        if (!post) {
            throw new NotFoundException('postNotFound');
        }

        const { currPostDesc } = postData;

        if (currPostDesc === post?.postDescription) {
            throw new NotFoundException('newDescriptionShouldBeAdded')
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
            throw new InternalServerErrorException('issueFacedUpdatingPost')
        }

        return resp;
    }



    async findPostById(postId: number): Promise<Post> {
        const post = await this.entityManager.findOne(Post, { where: { postId: postId } })

        if (!post) {
            throw new NotFoundException(`Post with ID ${postId} not found`);
        }
        return post
    }
}

















