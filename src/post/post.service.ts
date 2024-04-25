import { Injectable } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { EntityManager } from 'typeorm';
import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import path from 'path';
import { format } from 'date-fns';

@Injectable()
export class PostService {

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) { }

    async postFile(file) {

        const filePath: string = file.path;
        console.log('File Path:', filePath);
        // i can not get the id analyzise why
        //when youfind it you can store the user file path based on the id 
        const userId = this.userProvider.getCurrentUser().id;
        console.log(userId);
    };




















}


