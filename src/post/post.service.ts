import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';
import { Readable } from 'stream';
import { UserPostsDto } from './dtos/userPosts.dto';
import * as fs from 'fs/promises'
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

            const readableStream = new Readable({
                objectMode: true,
                read: async () => {
                    try {
                        for (const post of posts) {
                            const mediaContent = await this.fetchMedia(post.media);
                            const userPostsDto = new UserPostsDto();
                            userPostsDto.postId = post.postId;
                            userPostsDto.userId = post.userId;
                            userPostsDto.likesNr = post.likesNr;
                            userPostsDto.createdAt = post.createdAt;
                            userPostsDto.updatedAt = post.updatedAt;
                            userPostsDto.archived = post.archived;
                            userPostsDto.deleted = post.deleted;
                            userPostsDto.postDescription = post.postDescription;
                            userPostsDto.commentsNr = post.commentsNr;
                            userPostsDto.mediaContent = mediaContent;
                            readableStream.push(userPostsDto);
                        }
                        readableStream.push(null);
                    } catch (error) {
                        readableStream.emit('error', error);
                    }
                }

            })

            resp = readableStream;
        } catch (error) {
            throw error;
        }
        return resp;
    };

    async fetchMedia(mediaReference: string) {
        let resp: any;

        try {

            const mediaContent = await fs.readFile(mediaReference);
            resp = mediaContent;

        } catch (error) {
            throw new InternalServerErrorException('errorFetchingMedia');
        }
        return resp;
    }















}



















