import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength
} from 'class-validator';


export class CommentPostDto {

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
    postId: number;

    @ApiPropertyOptional({ example: 2, description: 'Comment Id of the comment that you are replying.' })
    @IsOptional()
    @IsNumber()
    parentCommentId?: number;

}


