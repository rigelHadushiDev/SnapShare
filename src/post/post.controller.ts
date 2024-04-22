import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import path from 'path';
import { format } from 'date-fns';
import { PostService } from './post.service';

// this should change to a logic maybe in the service
export const storage = {
    storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
            const filename: string = uuuidv4() + format(new Date(), '_yyyy_MM_dd_HH_mm_ss');
            const extension: string = ".jpg";
            cb(null, `${filename}${extension}`)
        }
    })
}

@Controller('post')
export class PostController {

    constructor(private readonly PostService: PostService) { }
    // we should creaet the service so we can do the correct logic
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    postFile(@UploadedFile() file): Observable<Object> {
        console.log(file);
        return of({ imagePath: file.path });
    }




}
