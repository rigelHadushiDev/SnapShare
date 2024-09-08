import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength
} from 'class-validator';


export class CommentEditDto {

    @ApiProperty({
        description: 'comment description', example: 'Bruv, your post is more lit than a road flare on a dark night, fam! ',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(700, { message: 'Comment description must be at most 700 characters long' })
    commentDescription: string;

    @ApiProperty({ example: 3, description: 'Post ID of the post that you are replying' })
    @IsNumber()
    @IsNotEmpty()
    commentId: number;
}


