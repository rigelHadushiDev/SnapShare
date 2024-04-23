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


    getStorage() {
        return diskStorage({
            destination: './uploads/posts',
            filename: (req, file, cb) => {
                const filename: string = uuidv4() + format(new Date(), '_yyyy_MM_dd_HH_mm_ss');
                const extension: string = path.extname(file.originalname); // Extract extension from original filename
                cb(null, `${filename}${extension}`);
            }
        });
    }

    async postFile(dat) { };




















}
function uuidv4() {
    throw new Error('Function not implemented.');
}

