import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';


export class PaginationDto {
    @ApiProperty({ description: 'Number of posts per page', example: 10 })
    @IsInt()
    @Min(1)
    postsByPage: number = 10;

    @ApiProperty({ description: 'Page number', example: 1 })
    @IsInt()
    @Min(1)
    page: number = 1;
}

export class GetUserPostsRes {
    @ApiProperty({ example: 48, description: 'ID of the post' })
    postId: number;

    @ApiProperty({ example: 0, description: 'Number of likes on the post' })
    likesNr: number;

    @ApiProperty({ example: '2024-07-07T14:21:27.871Z', description: 'Timestamp when the post was created' })
    createdAt: Date;

    @ApiProperty({ example: '2024-07-07T14:21:27.871Z', description: 'Timestamp when the post was last updated' })
    updatedAt: Date;

    @ApiProperty({ example: false, description: 'Flag indicating if the post is archived' })
    archive: boolean;

    @ApiProperty({ example: 'me in vacation', description: 'Description of the post' })
    postDescription: string;

    @ApiProperty({ example: 'http://example.com/images/post/12345/summer_vacation.jpg', description: 'URL of the post media' })
    media: string;

    @ApiProperty({ example: 0, description: 'Number of comments on the post' })
    commentsNr: number;

}