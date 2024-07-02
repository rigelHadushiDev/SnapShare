import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { Injectable } from "@nestjs/common";


@Injectable()
export class SnapShareUtility {

    static printToFile(variable: any, filename: string, ...pathParts: string[]) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const content = `${timestamp} ${JSON.stringify(variable, null, 2)}`;

        const datePath = path.join('logs', year.toString(), month, day);
        const fullPath = path.join(process.cwd(), datePath, ...pathParts);

        fs.mkdirSync(fullPath, { recursive: true });

        const timestampedFilename = `${filename}.log`;
        const filepath = path.join(fullPath, timestampedFilename);

        return fs.appendFileSync(filepath, content + '\n', { encoding: 'utf8' });
    }


    escapeString(str) {
        if (!str)
            return str;

        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char; // prepends a backslash to backslash, percent,
                // and double/single quotes
                default:
                    return char;
            }
        });
    }













}
