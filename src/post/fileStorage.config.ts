import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import { format } from 'date-fns';
import { extname } from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import * as path from 'path';

export const storage: MulterOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const destinationPath = path.join(process.cwd(), 'media', 'users', `${req['user'].username}`, 'posts');
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
            const filename: string = uuuidv4() + format(new Date(), '_yyyy_MM_dd_HH_mm_ss');
            const extension = extname(file.originalname);
            cb(null, `${filename}${extension}`);
        }
    })
};
