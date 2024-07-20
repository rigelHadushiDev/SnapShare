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

    async getMedia(hashedUser: string, type: string, filename: string, res: Response) {
        const filePath: string = `${path.join(process.cwd(), 'media', 'users', hashedUser, `${type}`, `${filename}`)}`;
        res.sendFile(filePath);
    }


    // story feed


    // post feed


}