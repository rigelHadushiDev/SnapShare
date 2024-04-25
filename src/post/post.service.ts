import { Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager } from 'typeorm';
import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import path from 'path';
import { format } from 'date-fns';
import { User } from 'src/user/user.entity';
import { Post } from './post.entity';

@Injectable()
export class PostService {

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) { }

    async postFile(file) {
        let post = new Post;
        try {

            const filePath: string = file.path;
            // now save the photo path in the post table but return photo is saved 
            const userId = await this.userProvider.getCurrUserId();


        } catch (error) {
            throw error;
        };

    };




















}



















