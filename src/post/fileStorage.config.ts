import { diskStorage } from 'multer';
import { v4 as uuuidv4 } from 'uuid';
import { format } from 'date-fns';
import { extname } from 'path';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

const allowedMimeTypes = [
    // Image MIME types
    'image/jpeg', // JPEG images
    'image/png', // PNG images
    'image/gif', // GIF images
    'image/bmp', // BMP images
    'image/webp', // WEBP images
    'image/tiff', // TIFF images
    'image/x-icon', // ICO images

    // Video MIME types
    'video/mp4', // MP4 videos
    'video/mpeg', // MPEG videos
    'video/quicktime', // QuickTime videos
    'video/x-msvideo', // AVI videos
    'video/x-flv', // FLV videos
    'video/x-matroska', // MKV videos
    'video/webm', // WEBM videos
    'video/3gpp', // 3GP videos
    'video/3gpp2', // 3G2 videos
];

export const storage: MulterOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            const destinationPath = path.join(process.cwd(), 'media', 'users', crypto.createHash('sha256').update(req['user'].username).digest('hex'), 'posts');
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
    }),
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('invalidFileType'), false);
        }
    }
};
