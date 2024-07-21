import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DescriptionDto {

    @ApiProperty({
        description: 'Description of the post media to be uploaded'
    })
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    description?: string;
}

export class CreatePostRes {
    @ApiProperty({ description: 'User ID of the post creator', example: '22b12a1f-92c4-4888-a8d7-f29311ce2eb5' })
    userId: string;

    @ApiProperty({ description: 'Description of the post', example: 'me in vacation' })
    postDescription: string;

    @ApiProperty({ description: 'URL or path to the media file of the post' })
    media: string;

    @ApiProperty({ description: 'Number of likes on the post', example: 0 })
    likesNr: number;

    @ApiProperty({ description: 'Number of comments on the post', example: 0 })
    commentsNr: number;

    @ApiProperty({ description: 'Unique identifier of the post', example: 51 })
    postId: number;

    @ApiProperty({ description: 'Timestamp when the post was created', example: '2024-07-07T16:03:04.917Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Timestamp when the post was last updated', example: '2024-07-07T16:03:04.917Z' })
    updatedAt: Date;

    @ApiProperty({ description: 'Flag indicating if the post is archived', example: false })
    archived: boolean;
}