import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';
import { Readable } from 'stream';
import { UserPostsDto } from './dtos/userPosts.dto';
import * as fs from 'fs/promises'
import * as path from 'path';
import { Response } from 'express';
@Injectable()
export class PostService {
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) { }

    async postFile(file: any, postData: any) {
        let resp: any
        try {
            const userId = this.userProvider.getCurrentUserId();
            const filePath: string = file.path;
            let post = new Post();
            let postDescription = postData.postDescription.replace(/^'(.*)'$/, '$1');

            await this.entityManager.transaction(async transactionalEntityManager => {
                // you should send the url 
                post.userId = userId;
                post.postDescription = postDescription;
                post.media = filePath;

                await transactionalEntityManager.save(Post, post);
            });

            resp = post;

        } catch (error) {
            throw error;
        };
        return resp;
    };

    async getUserPosts() {
        let resp: any;
        try {
            const userId = this.userProvider.getCurrentUserId();

            const posts = await this.entityManager
                .createQueryBuilder(Post, 'post')
                .where('post."userId" = :userId', { userId })
                .getMany();

            resp = posts;

        } catch (error) {
            throw error;
        }
        return resp;
    };

    async getUserMedia(userId: string, filename: string, res: Response) {
        const filePath = `${path.join(process.cwd(), 'media', 'users', userId, 'posts', `${filename}`)}`;
        res.sendFile(filePath);
    }

    // this can be deleted // keep it as a reference to read the file
    async fetchMedia(mediaReference: string) {
        let resp: any;

        try {
            const mediaContent = await fs.readFile(mediaReference);



        } catch (error) {
            throw new InternalServerErrorException('errorFetchingMedia');
        }
        return resp;
    }
















}



















