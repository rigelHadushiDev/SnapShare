import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';
import { Readable } from 'stream';
import { UserPostsDto } from './dtos/userPosts.dto';
import * as fs from 'fs/promises'
import path from 'path';
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

    // look up on how to test it hippie or curl or leave it later when you create the client side
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

    async getUserMedia(userId, filename) {

        const filePath = path.join(__dirname, 'media', 'users', userId, 'posts', `${filename}`);
        console.log(filePath);

        //open wp to see the link related on how to send the url as param or queryParam 

    }

    // this can be deleted // keep it as a reference to read the file
    async fetchMedia(mediaReference: string) {
        let resp: any;

        try {
            const mediaContent = await fs.readFile(mediaReference);
            //then send the file with the refernce in express res.sendFile() 
            //see how can you send it

        } catch (error) {
            throw new InternalServerErrorException('errorFetchingMedia');
        }
        return resp;
    }
















}



















