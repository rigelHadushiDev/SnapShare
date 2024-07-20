import { BadRequestException, Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Post } from '../post.entity';
import * as path from 'path';
import { Response } from 'express';
import { DescriptionDto } from '../dtos/CreatePost.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
const fs = require('fs');

@Injectable()
export class ContentMediaService {

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
            createdPost.media = SnapShareUtility.urlConverter(createdPost.media);

        resp = createdPost;

        return resp;
    };

    async getMedia(hashedUser: string, type: string, filename: string, res: Response) {
        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;
        res.sendFile(filePath);
    }
}