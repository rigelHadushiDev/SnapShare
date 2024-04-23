import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
const path = require('path');
import { format } from 'date-fns';
import { PostService } from './post.service';
import { extname } from 'path';


export const storage = {
    storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
            const filename: string = uuuidv4() + format(new Date(), '_yyyy_MM_dd_HH_mm_ss');
            const extension = extname(file.originalname)
            cb(null, `${filename}${extension}`)
        }
    })
}


@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }


    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    postFile(@UploadedFile() file): Observable<Object> {
        return of({ imagePath: file.path });
    }


}
