import { Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager, Transaction } from 'typeorm';
import multer, { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import path from 'path';
import { format } from 'date-fns';
import { User } from 'src/user/user.entity';
import { Post } from './post.entity';

@Injectable()
export class PostService {
    public user;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.user = this.userProvider.getCurrUserName()
    }

    // only file saving and file getting its path works
    async postFile(file: any, postDescription: any) {
        let resp: any
        try {

            const filePath: string = file.path;
            console.log(filePath, postDescription);
            let post = new Post();
            let user = this.user
            // const userID = (await this.entityManager.findOneBy(User, { user })).userId;

            await this.entityManager.transaction(async transactionalEntityManager => {

                // post.userId = userID;
                // write the post description
                // post.postDescription = ;
                post.media = filePath;

                await transactionalEntityManager.save(Post, post);
            });

            resp = post;

        } catch (error) {
            throw error;
        };
        return resp;
    };




















}



















