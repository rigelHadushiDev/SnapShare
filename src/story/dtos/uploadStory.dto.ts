import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class StoryMediaReq {
    @ApiProperty({
        description: 'Story media file',
        type: 'string',
        format: 'binary',
    })
    @IsNotEmpty()
    file: Express.Multer.File;
}
