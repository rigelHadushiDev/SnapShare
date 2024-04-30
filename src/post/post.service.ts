import { Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import { Post } from './post.entity';

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

    async getUserPosts() {
        let resp: any
        try {
            const userId = this.userProvider.getCurrentUserId();
            const queryBuilder = this.entityManager.createQueryBuilder(Post, 'post');

            const posts = await this.entityManager
                .createQueryBuilder(Post, 'post')
                .where('post."userId" = :userId', { userId }) // Ensure to use double quotes for column names
                .getMany();

            console.log(posts);
            // now fi\nd a way to show to read the media and also send their description

        } catch (error) {
            throw error;
        };
        return resp;
    };




















}



















