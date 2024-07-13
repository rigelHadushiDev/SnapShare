import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Scope } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';
import * as path from 'path';
import { Response, response } from 'express';
import { EditPostDto } from './dtos/EditPost.dto';
import { Observable } from 'rxjs';
import { DescriptionDto } from './dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
const fs = require('fs');

@Injectable()
export class PostService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
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
            SnapShareUtility.urlConverter(createdPost.media);

        resp = createdPost;

        return resp;
    };

    async getMedia(hashedUser: string, type: string, filename: string, res: Response) {
        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;
        res.sendFile(filePath);
    }


    async toggleArchivePost(postId: number): Promise<{ message: string; status: number }> {

        let resp: { message: string; status: number };

        const userId = this.UserID;

        let postStatus = await await this.entityManager
            .createQueryBuilder()
            .from(Post, 'post')
            .select('post.archived')
            .where('post.postId = :postId', { postId })
            .getOne();

        postStatus.archived === true ? false : true;

        await this.entityManager
            .createQueryBuilder()
            .update(Post)
            .set({ archived: true })
            .where('postId = :postId', { postId })
            .andWhere('userId = :userId', { userId })
            .andWhere('archived = :archived', { archived: postStatus.archived })
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

        const post = await this.entityManager.findOne(Post, { where: { postId: postId } })

        if (!post) {
            throw new NotFoundException(`postNotFound`);
        }

        return post;
    }
}

















